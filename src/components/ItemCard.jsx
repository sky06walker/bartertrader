import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import './ItemCard.css';

export default function ItemCard({ item, isOwner, hideSellerInfo = false }) {
  const { markTraded, markAvailable, addToCart, removeFromCart, isInCart } = useStore();
  const inCart = !isOwner && isInCart(item.id);

  async function handleMarkTraded(e) {
    e.preventDefault();
    e.stopPropagation();
    await markTraded(item.id);
  }

  async function handleMarkAvailable(e) {
    e.preventDefault();
    e.stopPropagation();
    await markAvailable(item.id);
  }

  async function handleCartToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      await removeFromCart(item.id);
    } else {
      await addToCart(item.id);
    }
  }

  return (
    <div className={`item-card glass-card ${item.status === 'traded' ? 'item-traded' : ''}`}>
      <div className="item-card-badges">
        <span className={`badge ${item.status === 'available' ? 'badge-available' : 'badge-traded'}`}>
          {item.status === 'available' ? '● AVAILABLE' : '✓ TRADED'}
        </span>
        {item.availableQty > 1 && (
          <span className="badge badge-qty">QTY: {item.availableQty}</span>
        )}
      </div>

      <div className="item-card-image">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" />
        ) : (
          <div className="item-card-no-image">📷</div>
        )}
      </div>

      <div className="item-card-body">
        <h3 className="item-card-name">{item.name}</h3>
        {item.exchangeLocation && (
          <p className="item-card-location">📍 {item.exchangeLocation}</p>
        )}

        {/* Seller info for marketplace */}
        {!isOwner && !hideSellerInfo && item.userName && (
          <Link to={`/seller/${item.userId}`} className="item-card-seller" style={{ textDecoration: 'none' }}>
            <span className="item-card-seller-avatar">
              {item.userName.charAt(0).toUpperCase()}
            </span>
            <div className="item-card-seller-info">
              <span className="item-card-seller-name">{item.userName} 🏪</span>
              <span className="item-card-seller-phone">📞 {item.userPhone}</span>
            </div>
          </Link>
        )}

        {item.tradeRequests && item.tradeRequests.length > 0 && (
          <div className="item-card-trades">
            <span className="item-card-wants">WANTS:</span>
            <div className="item-card-trade-tags">
              {item.tradeRequests.map((tr, i) => (
                <span key={i} className="trade-tag">
                  🔄 {tr.qty > 1 ? `${tr.item} ×${tr.qty}` : tr.item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="item-card-actions">
        {isOwner && (
          <>
            <Link to={`/item/${item.id}`} className="btn btn-ghost btn-sm">
              View Details
            </Link>
            {item.status === 'available' ? (
              <button className="btn btn-success btn-sm" onClick={handleMarkTraded}>
                ✓ Mark Traded
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={handleMarkAvailable}>
                ↩ Mark Available
              </button>
            )}
          </>
        )}
        {!isOwner && (
          <>
            <button
              className={`btn btn-sm ${inCart ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleCartToggle}
            >
              {inCart ? '✓ In Cart' : '🛒 Add to Cart'}
            </button>
            <a href={`tel:${item.userPhone}`} className="btn btn-ghost btn-sm">
              📞 Contact
            </a>
          </>
        )}
      </div>
    </div>
  );
}
