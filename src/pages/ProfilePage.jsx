import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { processImage } from "../store/imageStore";
import ImageUploader from "../components/ImageUploader";
import Toast from "../components/Toast";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { userProfile, updateUserProfile, deleteAccount } = useStore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "", // read-only
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState(null);

  // Pre-fill the form once the profile loads
  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || "",
        phone: userProfile.phone || "",
        email: userProfile.email || "",
      });
      // We don't populate avatarFile from userProfile.photoURL because ImageUploader 
      // accepts a 'currentImage' prop instead
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
      let photoURL = userProfile.photoURL;
      if (avatarFile) {
        photoURL = await processImage(avatarFile);
      }

      await updateUserProfile(userProfile.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        ...(photoURL && { photoURL }),
      });
      setToast("Profile updated successfully!");
      setAvatarFile(null); // Clear selected file after successful save
    } catch {
      setToast("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setToast(null);
    try {
      await deleteAccount();
      // Auth listener in useStore will auto redirect to '/' when user is cleared
    } catch (err) {
      console.error("Failed to delete account", err);
      // If error is auth-related (requires recent login), show specific message
      if (err.code === 'auth/requires-recent-login') {
        setToast("Please log out and log back in before deleting your account for security reasons.");
      } else {
        setToast("Failed to delete account. Please try again or contact support.");
      }
      setIsDeleting(false);
      setConfirmDelete(false);
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
          <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
            <label className="form-label" style={{ textAlign: 'center' }}>Profile Avatar</label>
            <div style={{ maxWidth: '200px', margin: '0 auto' }}>
              <ImageUploader 
                currentImage={userProfile?.photoURL} 
                onImageSelect={setAvatarFile} 
              />
            </div>
            <small className="profile-hint" style={{ textAlign: 'center', display: 'block', marginTop: '8px' }}>
              Optional. Upload a custom profile picture.
            </small>
          </div>

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

        {/* Danger Zone */}
        <div className="profile-danger-zone" style={{ marginTop: 'var(--space-2xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h3 style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-xs)' }}>Danger Zone</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
            Permanently delete your account and all associated personal data from BarterTrader.
          </p>
          
          {!confirmDelete ? (
            <button 
              className="btn btn-outline" 
              style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              onClick={() => setConfirmDelete(true)}
            >
              🗑️ Delete Account
            </button>
          ) : (
            <div className="profile-confirm-delete" style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-sm)' }}>
                <strong>Are you absolutely sure?</strong> This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button 
                  className="btn btn-danger" 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                </button>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

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
