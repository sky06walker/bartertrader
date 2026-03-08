import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';
import Toast from '../components/Toast';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, markTraded, markAvailable, deleteItem } = useStore();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'items', id));
      if (snap.exists()) {
        const data = snap.data();
        setItem({
          id: snap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          tradedAt: data.tradedAt?.toDate?.()?.toISOString() || null,
        });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="page"><div className="container"><p>Loading...</p></div></div>;
  if (!item) return <div className="page"><div className="container"><p>Item not found.</p></div></div>;

  const isOwner = item.userId === user?.uid;

  async function handleMarkTraded() {
    await markTraded(item.id);
    setItem((prev) => ({ ...prev, status: 'traded', tradedAt: new Date().toISOString() }));
    setToast('Item marked as traded!');
  }

  async function handleMarkAvailable() {
    await markAvailable(item.id);
    setItem((prev) => ({ ...prev, status: 'available', tradedAt: null }));
    setToast('Item marked as available!');
  }

  async function handleDelete() {
    await deleteItem(item.id);
    navigate('/');
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-md)' }}>
          ← Back
        </Link>

        <div className="glass-card" style={{ cursor: 'default' }}>
          {/* Image */}
          <div className="detail-image-wrap">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="detail-image" />
            ) : (
              <div className="detail-no-image">📷 No photo</div>
            )}
            <div className="detail-badges">
              <span className={`badge ${item.status === 'available' ? 'badge-available' : 'badge-traded'}`}>
                {item.status === 'available' ? '● AVAILABLE' : '✓ TRADED'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: 'var(--space-lg)' }}>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-sm)' }}>
              {item.name}
            </h1>

            {item.description && (
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
                {item.description}
              </p>
            )}

            <div className="detail-meta">
              {item.exchangeLocation && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">📍 Location</span>
                  <span>{item.exchangeLocation}</span>
                </div>
              )}
              <div className="detail-meta-item">
                <span className="detail-meta-label">📦 Quantity</span>
                <span>{item.availableQty}</span>
              </div>
              {item.createdAt && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">📅 Listed</span>
                  <span>{new Date(item.createdAt).toLocaleDateString('en-MY', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>

            {/* Seller Info (for non-owners) */}
            {!isOwner && (
              <div className="detail-seller">
                <div className="detail-seller-avatar">
                  {item.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{item.userName}</strong>
                  <a href={`tel:${item.userPhone}`} className="detail-seller-phone">📞 {item.userPhone}</a>
                </div>
              </div>
            )}

            {/* Trade Requests */}
            {item.tradeRequests && item.tradeRequests.length > 0 && (
              <div className="detail-trades">
                <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }}>
                  WANTS IN EXCHANGE
                </h3>
                <div className="detail-trade-tags">
                  {item.tradeRequests.map((tr, i) => (
                    <span key={i} className="trade-tag">
                      🔄 {tr.qty > 1 ? `${tr.qty} x ${tr.item}` : tr.item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {isOwner && (
              <div className="detail-actions">
                <Link to={`/edit/${item.id}`} className="btn btn-secondary">
                  ✏️ Edit
                </Link>
                {item.status === 'available' ? (
                  <button className="btn btn-success" onClick={handleMarkTraded}>
                    ✓ Mark Traded
                  </button>
                ) : (
                  <button className="btn btn-ghost" onClick={handleMarkAvailable}>
                    ↩ Mark Available
                  </button>
                )}
                {!confirmDelete ? (
                  <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
                    🗑️ Delete
                  </button>
                ) : (
                  <div className="detail-confirm-delete">
                    <span>Are you sure?</span>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                      Yes, Delete
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
