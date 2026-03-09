import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';
import ItemCard from '../components/ItemCard';
import './SellerPage.css';

export default function SellerPage() {
  const { userId } = useParams();
  const { user } = useStore();
  const [seller, setSeller] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      // Load seller profile
      const profileSnap = await getDoc(doc(db, 'users', userId));
      if (profileSnap.exists()) {
        setSeller({ id: profileSnap.id, ...profileSnap.data() });
      }

      // Load seller's available items
      const q = query(
        collection(db, 'items'),
        where('userId', '==', userId),
        where('status', '==', 'available')
      );
      const snap = await getDocs(q);
      const itemList = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
      itemList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setItems(itemList);
      setLoading(false);
    }
    load();
  }, [userId]);

  const isOwner = user?.uid === userId;
  const shareUrl = window.location.href;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${seller?.name}'s BarterTrader Shop`,
          text: `Check out ${seller?.name}'s items for trade!`,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return <div className="page"><div className="container"><p>Loading shop...</p></div></div>;
  }

  if (!seller) {
    return (
      <div className="page">
        <div className="container">
          <p>Seller not found.</p>
          <Link to="/marketplace" className="btn btn-primary">🏪 Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {/* Seller profile header */}
        <div className="seller-profile-header glass-card" style={{ cursor: 'default' }}>
          <div className="seller-profile-avatar">
            {seller.name?.charAt(0).toUpperCase()}
          </div>
          <div className="seller-profile-info">
            <h1 className="seller-profile-name">
              {seller.name}'s Shop
              {isOwner && <span className="badge badge-available" style={{ marginLeft: '8px' }}>YOU</span>}
            </h1>
            <p className="seller-profile-phone">📞 {seller.phone}</p>
            <p className="seller-profile-meta">
              {items.length} item{items.length !== 1 ? 's' : ''} available for trade
            </p>
          </div>
          <div className="seller-profile-actions">
            <button className="btn btn-primary btn-sm" onClick={handleShare}>
              {copied ? '✓ Link Copied!' : '🔗 Share Shop'}
            </button>
            {!isOwner && seller.phone && (
              <a
                href={`https://wa.me/${seller.phone?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-sm"
              >
                💬 WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Items grid */}
        {items.length > 0 ? (
          <div className="items-grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} isOwner={isOwner} hideSellerInfo={true} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🏪</div>
            <h3 className="empty-state-title">No items available</h3>
            <p className="empty-state-desc">This seller doesn't have any items listed right now.</p>
            <Link to="/marketplace" className="btn btn-primary">🏪 Back to Marketplace</Link>
          </div>
        )}
      </div>
    </div>
  );
}
