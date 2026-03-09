import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './TradeConfirmationPage.css';
import logoImg from '../assets/logo_transparent.png';

export default function TradeConfirmationPage() {
  const { tradeId } = useParams();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'trades', tradeId));
      if (snap.exists()) {
        const data = snap.data();
        setTrade({
          id: snap.id,
          ...data,
          confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        });
      }
      setLoading(false);
    }
    load();
  }, [tradeId]);

  if (loading) {
    return <div className="page"><div className="container"><p>Loading trade...</p></div></div>;
  }

  if (!trade) {
    return (
      <div className="page">
        <div className="container">
          <p>Trade not found.</p>
          <Link to="/cart" className="btn btn-primary">Back to Cart</Link>
        </div>
      </div>
    );
  }

  // Group items by seller
  const grouped = trade.items.reduce((acc, item) => {
    const key = item.sellerId;
    if (!acc[key]) {
      acc[key] = { sellerName: item.sellerName, sellerPhone: item.sellerPhone, items: [] };
    }
    acc[key].items.push(item);
    return acc;
  }, {});
  const sellers = Object.values(grouped);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Screen header */}
        <div className="page-header no-print">
          <h1 className="page-title">✅ Trade Confirmed!</h1>
          <p className="page-subtitle">
            Trade #{trade.id.slice(0, 8).toUpperCase()} — {new Date(trade.confirmedAt).toLocaleDateString('en-MY', {
              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
          <button className="btn btn-primary" onClick={() => window.print()}>
            🖨️ Print Summary
          </button>
          <Link to="/marketplace" className="btn btn-secondary">
            🏪 Back to Marketplace
          </Link>
          <Link to="/" className="btn btn-ghost">
            📦 My Items
          </Link>
        </div>

        {/* Printable summary */}
        <div className="trade-print-area">
          <div className="trade-print-header">
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <img src={logoImg} alt="BarterTrader Logo" style={{ height: '32px', width: 'auto' }} />
              Exchange Summary
            </h2>
            <p>Trade #{trade.id.slice(0, 8).toUpperCase()}</p>
            <p>{new Date(trade.confirmedAt).toLocaleDateString('en-MY', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}</p>
          </div>

          <div className="trade-print-buyer">
            <strong>Buyer:</strong> {trade.buyerName} ({trade.buyerPhone})
          </div>

          {sellers.map((seller, si) => (
            <div key={si} className="trade-print-seller glass-card" style={{ cursor: 'default' }}>
              <div className="trade-print-seller-header">
                <div className="trade-print-seller-avatar">
                  {seller.sellerName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{seller.sellerName}</strong>
                  <span className="trade-print-seller-phone">📞 {seller.sellerPhone}</span>
                </div>
              </div>

              <table className="trade-print-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Location</th>
                    <th>Wants in Exchange</th>
                  </tr>
                </thead>
                <tbody>
                  {seller.items.map((item, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><strong>{item.itemName}</strong></td>
                      <td>{item.qty}</td>
                      <td>{item.exchangeLocation || '—'}</td>
                      <td>
                        {item.tradeRequests && item.tradeRequests.length > 0
                          ? item.tradeRequests.map((tr) => `${tr.qty > 1 ? tr.qty + 'x ' : ''}${tr.item}`).join(', ')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="trade-print-total">
            <strong>Total Items:</strong> {trade.items.reduce((sum, i) => sum + (i.qty || 1), 0)} items
            from {sellers.length} seller{sellers.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
