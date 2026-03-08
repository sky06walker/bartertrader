import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { processImage } from '../store/imageStore';
import ImageUploader from '../components/ImageUploader';
import Toast from '../components/Toast';

export default function AddItemPage() {
  const { addItem, updateItem } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    exchangeLocation: '',
    availableQty: 1,
  });
  const [imageFile, setImageFile] = useState(null);
  const [tradeRequests, setTradeRequests] = useState([]);
  const [tradeInput, setTradeInput] = useState({ item: '', qty: 1 });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value,
    }));
  }

  function addTradeRequest() {
    if (!tradeInput.item.trim()) return;
    setTradeRequests((prev) => [...prev, { item: tradeInput.item.trim(), qty: tradeInput.qty }]);
    setTradeInput({ item: '', qty: 1 });
  }

  function removeTradeRequest(index) {
    setTradeRequests((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setToast('Please enter an item name');
      return;
    }
    setSubmitting(true);
    try {
      const itemId = await addItem({
        name: form.name.trim(),
        description: form.description.trim(),
        exchangeLocation: form.exchangeLocation.trim(),
        availableQty: form.availableQty,
        tradeRequests,
        imageUrl: null,
      });

      // Process and store image as base64 in Firestore
      if (imageFile && itemId) {
        const imageUrl = await processImage(imageFile);
        await updateItem(itemId, { imageUrl });
      }

      setToast('Item added successfully!');
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      console.error('Failed to add item:', err);
      setToast('Failed to add item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="page-header">
          <h1 className="page-title">Add New Item</h1>
          <p className="page-subtitle">List an item for barter trade</p>
        </div>

        <form className="glass-card" onSubmit={handleSubmit} style={{ cursor: 'default' }}>
          <ImageUploader onImageSelect={setImageFile} />

          <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
            <label className="form-label">Item Name *</label>
            <input
              className="form-input"
              name="name"
              placeholder="What are you trading?"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              name="description"
              placeholder="Describe the item condition, details..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Exchange Location</label>
            <input
              className="form-input"
              name="exchangeLocation"
              placeholder="Where to meet for exchange?"
              value={form.exchangeLocation}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Available Qty</label>
            <input
              className="form-input"
              name="availableQty"
              type="number"
              min="1"
              value={form.availableQty}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">What I Want in Exchange</label>
            <div className="trade-request-input">
              <input
                className="form-input"
                placeholder="Item name"
                value={tradeInput.item}
                onChange={(e) => setTradeInput((p) => ({ ...p, item: e.target.value }))}
              />
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="Qty"
                value={tradeInput.qty}
                onChange={(e) => setTradeInput((p) => ({ ...p, qty: parseInt(e.target.value) || 1 }))}
                style={{ width: '80px' }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addTradeRequest}>
                Add
              </button>
            </div>
            {tradeRequests.length > 0 && (
              <div className="trade-request-list">
                {tradeRequests.map((tr, i) => (
                  <div key={i} className="trade-request-item">
                    <span className="trade-tag">
                      🔄 {tr.qty > 1 ? `${tr.qty} x ${tr.item}` : tr.item}
                    </span>
                    <button
                      type="button"
                      className="trade-request-remove"
                      onClick={() => removeTradeRequest(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
            style={{ width: '100%', marginTop: 'var(--space-md)' }}
          >
            {submitting ? '⏳ Saving...' : '💾 Save Item'}
          </button>
        </form>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
