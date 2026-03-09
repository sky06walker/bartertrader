import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import Toast from "../components/Toast";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { userProfile, updateUserProfile } = useStore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "", // read-only
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Pre-fill the form once the profile loads
  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || "",
        phone: userProfile.phone || "",
        email: userProfile.email || "",
      });
    }
  }, [userProfile]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setToast("Name is required.");
      return;
    }
    if (!form.phone.trim()) {
      setToast("Phone number is required.");
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      await updateUserProfile(userProfile.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      setToast("Profile updated successfully!");
    } catch {
      setToast("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h2>My Profile</h2>
          <p>Update your personal details below.</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label className="form-label">Email Address (Read-Only)</label>
            <input
              className="form-input profile-readonly"
              type="email"
              value={form.email}
              disabled
              title="Your email is tied to you login method and cannot be changed here."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Display Name *</label>
            <input
              className="form-input"
              type="text"
              name="name"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              className="form-input"
              type="tel"
              name="phone"
              placeholder="012-3456789"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <small className="profile-hint">
              Required. Providing a phone number makes it easier for other users
              to coordinate trades.
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary profile-submit"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="profile-footer">
          <Link to="/" className="profile-back-link">
            &larr; Back to My Items
          </Link>
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
