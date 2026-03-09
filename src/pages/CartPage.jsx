import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Toast from '../components/Toast';
import './CartPage.css';

export default function CartPage() {
  const { cart, allItems, removeFromCart, clearCart, confirmTrade, user } = useStore();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartQtys, setCartQtys] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState(null);

  // Resolve cart item IDs to full item data
  useEffect(() => {
    async function loadCartItems() {
      if (cart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const items = [];
      for (const itemId of cart) {
        const cached = allItems.find((i) => i.id === itemId);
        if (cached) {
          items.push(cached);
        } else {
          const snap = await getDoc(doc(db, 'items', itemId));
          if (snap.exists()) {
            const data = snap.data();
            items.push({
              id: snap.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            });
          }
        }
      }
      setCartItems(items);

      // Initialize qty for each item (default 1)
      const newQtys = {};
      items.forEach((item) => {
        newQtys[item.id] = cartQtys[item.id] || 1;
      });
      setCartQtys(newQtys);
      setLoading(false);
    }
    loadCartItems();
  }, [cart, allItems]);

  // Group items by seller
  const grouped = cartItems.reduce((acc, item) => {
    const key = item.userId;
    if (!acc[key]) {
      acc[key] = {
        userName: item.userName,
        userPhone: item.userPhone,
        userId: item.userId,
        items: [],
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  const sellers = Object.values(grouped);
  const isOwnItem = (item) => item.userId === user?.uid;
  const unavailableItems = cartItems.filter((i) => i.status !== 'available');
  const validItems = cartItems.filter((i) => i.status === 'available' && !isOwnItem(i));

  function updateQty(itemId, qty) {
    const item = cartItems.find((i) => i.id === itemId);
    const max = item?.availableQty || 1;
    setCartQtys((prev) => ({ ...prev, [itemId]: Math.max(1, Math.min(qty, max)) }));
  }

  async function handleRemove(itemId) {
    await removeFromCart(itemId);
    setToast('Removed from cart');
  }

  async function handleClearAll() {
    await clearCart();
    setToast('Cart cleared');
  }

  async function handleConfirmTrade() {
    if (validItems.length === 0) {
      setToast('No valid items to trade');
      return;
    }
    setConfirming(true);
    try {
      const itemsWithQty = validItems.map((item) => ({
        ...item,
        cartQty: cartQtys[item.id] || 1,
      }));
      const tradeId = await confirmTrade(itemsWithQty);
      if (tradeId) {
        navigate(`/trade/${tradeId}`);
      }
    } catch (err) {
      console.error('Failed to confirm trade:', err);
      setToast('Failed to confirm trade. Please try again.');
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return <div className="page"><div className="container"><p>Loading cart...</p></div></div>;
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">🛒 My Cart</h1>
            <p className="page-subtitle">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} from {sellers.length} seller{sellers.length !== 1 ? 's' : ''}
            </p>
          </div>
          {cartItems.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleClearAll}>
              🗑️ Clear All
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3 className="empty-state-title">Your cart is empty</h3>
            <p className="empty-state-desc">Browse the marketplace and add items you want to trade for.</p>
            <Link to="/marketplace" className="btn btn-primary">🏪 Browse Marketplace</Link>
          </div>
        ) : (
          <>
            {unavailableItems.length > 0 && (
              <div className="cart-warning" style={{
                padding: 'var(--space-md)', background: 'var(--color-warning-bg)',
                border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)',
                color: 'var(--color-warning)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)'
              }}>
                ⚠️ {unavailableItems.length} item{unavailableItems.length !== 1 ? 's' : ''} in your cart {unavailableItems.length !== 1 ? 'are' : 'is'} no longer available and will be skipped.
              </div>
            )}

            <div className="cart-sellers">
              {sellers.map((seller) => (
                <div key={seller.userId} className="cart-seller-group glass-card" style={{ cursor: 'default' }}>
                  <div className="cart-seller-header">
                    <div className="cart-seller-avatar">
                      {seller.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="cart-seller-info">
                      <strong>{seller.userName}</strong>
                      <a href={`tel:${seller.userPhone}`} className="cart-seller-phone">
                        📞 {seller.userPhone}
                      </a>
                    </div>
                    <Link to={`/seller/${seller.userId}`} className="btn btn-ghost btn-sm">
                      🏪 View Shop
                    </Link>
                  </div>

                  <div className="cart-items-list">
                    {seller.items.map((item) => (
                      <div key={item.id} className={`cart-item ${item.status !== 'available' ? 'cart-item-traded' : ''}`}>
                        <div className="cart-item-image">
                          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>📷</span>}
                        </div>
                        <div className="cart-item-details">
                          <Link to={`/item/${item.id}`} className="cart-item-name">{item.name}</Link>
                          <div className="cart-item-meta">
                            <span className={`badge ${item.status === 'available' ? 'badge-available' : 'badge-traded'}`}>
                              {item.status === 'available' ? '● AVAILABLE' : '✓ TRADED'}
                            </span>
                            <span className="badge badge-qty">STOCK: {item.availableQty}</span>
                            {item.exchangeLocation && (
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                📍 {item.exchangeLocation}
                              </span>
                            )}
                          </div>
                          {item.tradeRequests && item.tradeRequests.length > 0 && (
                            <div className="cart-item-trades">
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Wants: </span>
                              {item.tradeRequests.map((tr, i) => (
                                <span key={i} className="trade-tag" style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px' }}>
                                  {tr.qty > 1 ? `${tr.qty}x ${tr.item}` : tr.item}
                                </span>
                              ))}
                            </div>
                          )}
                          {isOwnItem(item) && (
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-warning)' }}>⚠️ This is your own item</span>
                          )}
                        </div>

                        {/* Qty selector */}
                        {item.status === 'available' && !isOwnItem(item) && (
                          <div className="cart-item-qty">
                            <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Qty</label>
                            <div className="cart-qty-controls">
                              <button
                                className="cart-qty-btn"
                                onClick={() => updateQty(item.id, (cartQtys[item.id] || 1) - 1)}
                                disabled={(cartQtys[item.id] || 1) <= 1}
                              >−</button>
                              <input
                                type="number"
                                className="cart-qty-input"
                                min="1"
                                max={item.availableQty}
                                value={cartQtys[item.id] === '' ? '' : (cartQtys[item.id] || 1)}
                                onChange={(e) => {
                                  let val = parseInt(e.target.value);
                                  if (isNaN(val)) {
                                    setCartQtys((prev) => ({ ...prev, [item.id]: '' }));
                                  } else {
                                    setCartQtys((prev) => ({ ...prev, [item.id]: val }));
                                  }
                                }}
                                onBlur={(e) => {
                                  let val = parseInt(e.target.value);
                                  if (isNaN(val) || val < 1) val = 1;
                                  if (val > item.availableQty) val = item.availableQty;
                                  updateQty(item.id, val);
                                }}
                                style={{
                                  width: '50px',
                                  textAlign: 'center',
                                  background: 'rgba(0,0,0,0.2)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '4px',
                                  color: 'var(--color-text)',
                                  fontSize: 'var(--font-size-sm)',
                                  padding: '4px',
                                  MozAppearance: 'textfield'
                                }}
                              />
                              <button
                                className="cart-qty-btn"
                                onClick={() => updateQty(item.id, (cartQtys[item.id] || 1) + 1)}
                                disabled={(cartQtys[item.id] || 1) >= item.availableQty}
                              >+</button>
                            </div>
                          </div>
                        )}

                        <button
                          className="btn btn-ghost btn-icon cart-item-remove"
                          onClick={() => handleRemove(item.id)}
                          title="Remove from cart"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Confirm Trade */}
            {validItems.length > 0 && (
              <div className="cart-confirm-bar">
                <div className="cart-confirm-summary">
                  <strong>{validItems.length} item{validItems.length !== 1 ? 's' : ''}</strong>
                  <span> — Total qty: {validItems.reduce((s, i) => s + (cartQtys[i.id] || 1), 0)}</span>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleConfirmTrade}
                  disabled={confirming}
                >
                  {confirming ? '⏳ Confirming...' : '✅ Confirm Trade'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
