import { useState } from 'react';
import { useStore } from '../store/useStore';
import Toast from '../components/Toast';
import './TradeSummaryPage.css';

export default function TradeSummaryPage() {
  const { userProfile, myItems, bulkMarkTraded } = useStore();
  const [selected, setSelected] = useState(new Set());
  const [toast, setToast] = useState(null);

  const items = myItems;
  const availableItems = items.filter((i) => i.status === 'available');
  const tradedItems = items.filter((i) => i.status === 'traded');

  // Aggregate all trade requests across ALL items into totals
  function aggregateTradeRequests(itemList) {
    const totals = {};
    itemList.forEach((item) => {
      if (item.tradeRequests) {
        item.tradeRequests.forEach((tr) => {
          const name = tr.item.toLowerCase();
          totals[name] = (totals[name] || 0) + (tr.qty || 1) * (item.availableQty || 1);
        });
      }
    });
    return totals;
  }

  const totalWillGet = aggregateTradeRequests(items);
  const totalWillGetStr = Object.entries(totalWillGet)
    .map(([name, qty]) => `${qty} x ${name}`)
    .join(', ');

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllAvailable() {
    if (selected.size === availableItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(availableItems.map((i) => i.id)));
    }
  }

  async function handleBulkMarkTraded() {
    if (selected.size === 0) return;
    await bulkMarkTraded(Array.from(selected));
    setToast(`${selected.size} item(s) marked as traded!`);
    setSelected(new Set());
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="page">
      <div className="container">
        {/* ===== PRINT-ONLY SUMMARY ===== */}
        <div className="print-only-summary">
          <div className="print-summary-header">
            <h1>{userProfile?.name} ({userProfile?.phone})</h1>
          </div>

          {Object.keys(totalWillGet).length > 0 && (
            <div className="print-summary-totals">
              <strong>Total of items will get:</strong> {totalWillGetStr}
            </div>
          )}

          <div className="print-summary-details">
            <strong>Details:</strong>
            <ol className="print-detail-list">
              {items.map((item) => {
                const giving = item.availableQty > 1
                  ? `${item.availableQty} x ${item.name}`
                  : item.availableQty === 1
                    ? `1 ${item.name}`
                    : item.name;
                const wanting = item.tradeRequests && item.tradeRequests.length > 0
                  ? item.tradeRequests.map((tr) =>
                      tr.qty > 1 ? `${tr.qty} x ${tr.item}` : `1 x ${tr.item}`
                    ).join(', ')
                  : 'Not specified';
                const tradedLabel = item.status === 'traded' ? ' [TRADED]' : '';
                return (
                  <li key={item.id}>
                    {giving} <span className="print-arrow">&gt;</span> {wanting}
                    {tradedLabel && <span className="print-traded-label">{tradedLabel}</span>}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="print-summary-footer">
            Printed from BarterTrader · {new Date().toLocaleDateString('en-MY', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
        </div>

        {/* ===== SCREEN UI ===== */}
        <div className="screen-only">
          <div className="page-header summary-page-header">
            <div>
              <h1 className="page-title">Trade Summary</h1>
              <p className="page-subtitle">Overview of your barter trading activity</p>
            </div>
            <button className="btn btn-primary" onClick={handlePrint}>
              🖨️ Print Summary
            </button>
          </div>

          {/* User Info Card */}
          <div className="summary-user glass-card">
            <div className="summary-user-avatar">
              {userProfile?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="summary-user-info">
              <h2 className="summary-user-name">{userProfile?.name} ({userProfile?.phone})</h2>
              {userProfile?.email && <p className="summary-user-contact">✉️ {userProfile.email}</p>}
            </div>
          </div>

          {/* Totals Banner */}
          {Object.keys(totalWillGet).length > 0 && (
            <div className="summary-totals glass-card">
              <h3 className="summary-totals-title">📊 Total of items will get</h3>
              <div className="summary-totals-tags">
                {Object.entries(totalWillGet).map(([name, qty]) => (
                  <span key={name} className="trade-tag trade-tag-lg">
                    <span className="trade-tag-icon">🔄</span>
                    {qty} x {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="summary-stats">
            <div className="summary-stat glass-card">
              <span className="summary-stat-icon">📦</span>
              <span className="summary-stat-value">{items.length}</span>
              <span className="summary-stat-label">Total Items</span>
            </div>
            <div className="summary-stat glass-card">
              <span className="summary-stat-icon">●</span>
              <span className="summary-stat-value summary-stat-available">{availableItems.length}</span>
              <span className="summary-stat-label">Available</span>
            </div>
            <div className="summary-stat glass-card">
              <span className="summary-stat-icon">✓</span>
              <span className="summary-stat-value summary-stat-traded">{tradedItems.length}</span>
              <span className="summary-stat-label">Traded</span>
            </div>
          </div>

          {/* Available Items — with bulk select */}
          {availableItems.length > 0 && (
            <div className="summary-section">
              <div className="summary-section-header">
                <h3 className="summary-section-title">
                  <span className="badge badge-available" style={{ marginRight: '8px' }}>● Available</span>
                  Items ({availableItems.length})
                </h3>
                <div className="summary-bulk-actions">
                  <button className="btn btn-ghost btn-sm" onClick={selectAllAvailable}>
                    {selected.size === availableItems.length ? '☐ Deselect All' : '☑ Select All'}
                  </button>
                  {selected.size > 0 && (
                    <button className="btn btn-success btn-sm" onClick={handleBulkMarkTraded}>
                      ✓ Mark {selected.size} as Traded
                    </button>
                  )}
                </div>
              </div>

              <div className="summary-table-wrap glass-card">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th className="summary-table-check"></th>
                      <th>#</th>
                      <th>Item (Giving)</th>
                      <th></th>
                      <th>Wants in Exchange</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableItems.map((item, i) => {
                      const isSelected = selected.has(item.id);
                      return (
                        <tr key={item.id} className={isSelected ? 'row-selected' : ''} onClick={() => toggleSelect(item.id)}>
                          <td className="summary-table-check">
                            <label className="checkbox-wrap" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} />
                              <span className="checkbox-custom"></span>
                            </label>
                          </td>
                          <td className="summary-table-num">{i + 1}</td>
                          <td>
                            <strong>{item.availableQty > 1 ? `${item.availableQty} x ${item.name}` : item.name}</strong>
                            {item.description && <span className="summary-table-desc">{item.description}</span>}
                          </td>
                          <td className="summary-table-arrow">▸</td>
                          <td>
                            {item.tradeRequests && item.tradeRequests.length > 0 ? (
                              <div className="summary-trade-tags">
                                {item.tradeRequests.map((tr, j) => (
                                  <span key={j} className="trade-tag">{tr.qty > 1 ? `${tr.qty} x ${tr.item}` : `1 x ${tr.item}`}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="summary-table-muted">Not specified</span>
                            )}
                          </td>
                          <td className="summary-table-loc">{item.exchangeLocation || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Traded Items */}
          {tradedItems.length > 0 && (
            <div className="summary-section">
              <h3 className="summary-section-title">
                <span className="badge badge-traded" style={{ marginRight: '8px' }}>✓ Traded</span>
                Items ({tradedItems.length})
              </h3>
              <div className="summary-table-wrap glass-card">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item</th>
                      <th>Traded Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradedItems.map((item, i) => (
                      <tr key={item.id} className="summary-traded-row">
                        <td className="summary-table-num">{i + 1}</td>
                        <td><strong>{item.availableQty > 1 ? `${item.availableQty} x ${item.name}` : item.name}</strong></td>
                        <td className="summary-table-date">
                          {item.tradedAt
                            ? new Date(item.tradedAt).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3 className="empty-state-title">No items to summarize</h3>
              <p className="empty-state-desc">Add some items to see your trade summary here.</p>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
