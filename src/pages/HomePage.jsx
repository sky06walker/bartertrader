import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ItemCard from '../components/ItemCard';

export default function HomePage() {
  const { myItems } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = myItems.filter((item) => {
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'available' && item.status === 'available') ||
      (filter === 'traded' && item.status === 'traded');
    return matchSearch && matchFilter;
  });

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Items</h1>
            <p className="page-subtitle">Manage your listed items for trade</p>
          </div>
        </div>

        {myItems.length > 0 && (
          <div className="home-controls">
            <input
              className="form-input search-input"
              type="text"
              placeholder="🔍 Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="filter-tabs">
              {['all', 'available', 'traded'].map((f) => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? `All (${myItems.length})` :
                   f === 'available' ? `Available (${myItems.filter(i => i.status === 'available').length})` :
                   `Traded (${myItems.filter(i => i.status === 'traded').length})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="items-grid">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} isOwner={true} />
            ))}
          </div>
        ) : myItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3 className="empty-state-title">No items yet</h3>
            <p className="empty-state-desc">Start listing items to trade with others!</p>
            <Link to="/add" className="btn btn-primary">
              + Add First Item
            </Link>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">No matches</h3>
            <p className="empty-state-desc">Try a different search or filter.</p>
          </div>
        )}

        {myItems.length > 0 && (
          <Link to="/add" className="fab" aria-label="Add item">+</Link>
        )}
      </div>
    </div>
  );
}
