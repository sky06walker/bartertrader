import { useState } from 'react';
import { useStore } from '../store/useStore';
import ItemCard from '../components/ItemCard';
import './MarketplacePage.css';

export default function MarketplacePage() {
  const { allItems, user } = useStore();
  const [search, setSearch] = useState('');

  // Show all available items from OTHER users
  const marketItems = allItems.filter((item) => {
    const isOther = item.userId !== user?.uid;
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.userName?.toLowerCase().includes(search.toLowerCase());
    return isOther && matchSearch;
  });

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">🏪 Marketplace</h1>
            <p className="page-subtitle">Browse items from other traders</p>
          </div>
        </div>

        <input
          className="form-input search-input"
          type="text"
          placeholder="🔍 Search items or sellers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 'var(--space-lg)' }}
        />

        {marketItems.length > 0 ? (
          <div className="items-grid">
            {marketItems.map((item) => (
              <ItemCard key={item.id} item={item} isOwner={false} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🏪</div>
            <h3 className="empty-state-title">No items from other traders yet</h3>
            <p className="empty-state-desc">When other users list items, they'll appear here. Share the app with friends!</p>
          </div>
        )}
      </div>
    </div>
  );
}
