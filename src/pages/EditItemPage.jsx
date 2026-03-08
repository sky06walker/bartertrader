import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';
import { processImage } from '../store/imageStore';
import ImageUploader from '../components/ImageUploader';
import Toast from '../components/Toast';

export default function EditItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateItem } = useStore();
  const [form, setForm] = useState({
    name: '',
    description: '',
    exchangeLocation: '',
    availableQty: 1,
  });
  const [tradeRequests, setTradeRequests] = useState([]);
  const [tradeInput, setTradeInput] = useState({ item: '', qty: 1 });
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'items', id));
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          name: data.name || '',
          description: data.description || '',
          exchangeLocation: data.exchangeLocation || '',
          availableQty: data.availableQty || 1,
        });
        setTradeRequests(data.tradeRequests || []);
        setExistingImage(data.imageUrl || null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

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
      const updateData = {
        name: form.name.trim(),
        description: form.description.trim(),
        exchangeLocation: form.exchangeLocation.trim(),
        availableQty: form.availableQty,
        tradeRequests,
      };

      if (imageFile) {
        const imageUrl = await processImage(imageFile);
        updateData.imageUrl = imageUrl;
      }

      await updateItem(id, updateData);
      setToast('Item updated!');
      setTimeout(() => navigate(`/item/${id}`), 500);
    } catch (err) {
      console.error('Failed to update:', err);
      setToast('Failed to update. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page"><div className="container"><p>Loading...</p></div></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="page-header">
          <h1 className="page-title">Edit Item</h1>
        </div>

        <form className="glass-card" onSubmit={handleSubmit} style={{ cursor: 'default' }}>
          {existingImage && !imageFile && (
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <img src={existingImage} alt="Current" style={{ width: '100%', borderRadius: '8px' }} />
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Current photo. Upload a new one below to replace.
              </p>
            </div>
          )}

          <ImageUploader onImageSelect={setImageFile} />

          <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
            <label className="form-label">Item Name *</label>
            <input className="form-input" name="name" value={form.name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>

          <div className="form-group">
            <label className="form-label">Exchange Location</label>
            <input className="form-input" name="exchangeLocation" value={form.exchangeLocation} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Available Qty</label>
            <input className="form-input" name="availableQty" type="number" min="1" value={form.availableQty} onChange={handleChange} />
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
                value={tradeInput.qty}
                onChange={(e) => setTradeInput((p) => ({ ...p, qty: parseInt(e.target.value) || 1 }))}
                style={{ width: '80px' }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addTradeRequest}>Add</button>
            </div>
            {tradeRequests.length > 0 && (
              <div className="trade-request-list">
                {tradeRequests.map((tr, i) => (
                  <div key={i} className="trade-request-item">
                    <span className="trade-tag">🔄 {tr.qty > 1 ? `${tr.qty} x ${tr.item}` : tr.item}</span>
                    <button type="button" className="trade-request-remove" onClick={() => removeTradeRequest(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
            {submitting ? '⏳ Saving...' : '💾 Update Item'}
          </button>
        </form>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
