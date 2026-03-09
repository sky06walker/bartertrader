import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import './CartPage.css'; // Reusing some cart card styles

export default function TradeHistoryPage() {
  const { tradeHistory, loading, user } = useStore();

  if (loading) {
    return <div className="page"><div className="container"><p>Loading history...</p></div></div>;
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <h1 className="page-title">📜 My Exchanges</h1>
          <p className="page-subtitle">History of your confirmed barter trades</p>
        </div>

        {tradeHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📜</div>
            <h3 className="empty-state-title">No trade history</h3>
            <p className="empty-state-desc">You haven't confirmed any exchanges yet.</p>
            <Link to="/marketplace" className="btn btn-primary">🏪 Go to Marketplace</Link>
          </div>
        ) : (
          <div className="trade-history-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {tradeHistory.map((trade) => {
              const isBuyer = trade.buyerId === user?.uid;
              const roleLabel = isBuyer ? "Buyer" : "Seller";
              const totalItems = trade.items.reduce((sum, item) => sum + (item.qty || 1), 0);

              return (
                <div key={trade.id} className="glass-card" style={{ padding: 'var(--space-md)', cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '4px' }}>
                        Trade #{trade.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {new Date(trade.confirmedAt).toLocaleDateString('en-MY', {
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${isBuyer ? 'badge-available' : 'badge-traded'}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                        Role: {roleLabel}
                      </span>
                      <br />
                      <Link to={`/trade/${trade.id}`} className="btn btn-ghost btn-sm">
                        📄 View Summary
                      </Link>
                    </div>
                  </div>

                  <div style={{ fontSize: 'var(--font-size-sm)' }}>
                    <p style={{ marginBottom: '4px' }}><strong>Items Exchanged:</strong> {totalItems}</p>
                    {isBuyer ? (
                      <p style={{ color: 'var(--color-text-secondary)' }}>You initiated this trade with {trade.items.length} seller(s).</p>
                    ) : (
                      <p style={{ color: 'var(--color-text-secondary)' }}>Trader <strong>{trade.buyerName}</strong> requested {trade.items.filter(i => i.sellerId === user?.uid).length} of your items.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
