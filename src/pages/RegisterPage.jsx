import { useState } from "react";
import { Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../firebase";
import { useStore } from "../store/useStore";
import Toast from "../components/Toast";
import "./RegisterPage.css";
import logoImg from "../assets/logo_transparent.png";

export default function RegisterPage() {
  const { saveUserProfile } = useStore();
  const [mode, setMode] = useState("signup"); // 'signup' | 'signin' | 'forgot'
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSocialLogin(provider) {
    setSubmitting(true);
    try {
      await signInWithPopup(auth, provider);
      // Profile auto-created in useStore's onAuthStateChanged
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        // User closed popup — no error needed
      } else if (err.code === "auth/account-exists-with-different-credential") {
        setToast(
          "An account already exists with the same email. Try a different login method.",
        );
      } else if (err.code === "auth/cancelled-popup-request") {
        // Duplicate popup — ignore
      } else {
        setToast("Social login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (mode === "forgot") {
      if (!form.email.trim()) {
        setToast("Please enter your email address");
        return;
      }
      setSubmitting(true);
      try {
        await sendPasswordResetEmail(auth, form.email.trim());
        setResetSent(true);
        setToast("Password reset email sent! Check your inbox.");
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          setToast("No account found with this email");
        } else if (err.code === "auth/invalid-email") {
          setToast("Invalid email address");
        } else {
          setToast("Failed to send reset email. Try again.");
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (mode === "signup") {
      if (
        !form.name.trim() ||
        !form.phone.trim() ||
        !form.email.trim() ||
        !form.password.trim()
      ) {
        setToast("Please fill in all fields");
        return;
      }
      if (form.password.length < 6) {
        setToast("Password must be at least 6 characters");
        return;
      }
    } else {
      if (!form.email.trim() || !form.password.trim()) {
        setToast("Please enter email and password");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password,
        );
        await saveUserProfile(cred.user.uid, {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        });
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      }
    } catch (err) {
      let msg = "Something went wrong";
      if (err.code === "auth/email-already-in-use")
        msg = "Email already registered. Try signing in.";
      else if (err.code === "auth/invalid-email") msg = "Invalid email address";
      else if (err.code === "auth/weak-password")
        msg = "Password too weak (min 6 characters)";
      else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      )
        msg = "Invalid email or password";
      setToast(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    setResetSent(false);
  }

  return (
    <div className="register-page-wrapper">
      <div className="register-page">
        <div className="register-container">
          <div className="register-header">
            <img
              src={logoImg}
              alt="BarterTrader Logo"
              className="register-logo-img"
            />
            <h1 className="register-brand" style={{ display: "none" }}>
              BarterTrader
            </h1>
            <p className="register-tagline">
              Trade items, not money.{" "}
              {mode === "signup"
                ? "Create your account."
                : mode === "signin"
                  ? "Welcome back!"
                  : "Reset your password."}
            </p>
          </div>

          <div className="register-tabs">
            <button
              className={`register-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => switchMode("signup")}
            >
              Sign Up
            </button>
            <button
              className={`register-tab ${mode === "signin" || mode === "forgot" ? "active" : ""}`}
              onClick={() => switchMode("signin")}
            >
              Sign In
            </button>
          </div>

          <form className="register-form glass-card" onSubmit={handleSubmit}>
            <h2 className="register-form-title">
              {mode === "signup"
                ? "Create Account"
                : mode === "signin"
                  ? "Sign In"
                  : "🔐 Forgot Password"}
            </h2>

            {mode === "forgot" && resetSent ? (
              <div
                style={{
                  padding: "var(--space-lg)",
                  textAlign: "center",
                  background: "rgba(16,185,129,0.08)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--font-size-3xl)",
                    marginBottom: "var(--space-sm)",
                  }}
                >
                  📧
                </p>
                <p style={{ color: "var(--color-success)", fontWeight: 600 }}>
                  Reset email sent!
                </p>
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "var(--font-size-sm)",
                    marginTop: "var(--space-xs)",
                  }}
                >
                  Check your inbox for <strong>{form.email}</strong> and follow
                  the link to reset your password.
                </p>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: "var(--space-md)" }}
                  onClick={() => switchMode("signin")}
                >
                  ← Back to Sign In
                </button>
              </div>
            ) : (
              <>
                {mode === "signup" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input
                        className="form-input"
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Phone Number <span className="required">*</span>
                      </label>
                      <input
                        className="form-input"
                        type="tel"
                        name="phone"
                        placeholder="012-3456789"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      className="form-input"
                      type="password"
                      name="password"
                      placeholder={
                        mode === "signup"
                          ? "Min 6 characters"
                          : "Enter your password"
                      }
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {mode === "signin" && (
                  <div
                    style={{
                      textAlign: "right",
                      marginTop: "-8px",
                      marginBottom: "var(--space-sm)",
                    }}
                  >
                    <button
                      type="button"
                      className="btn-text-link"
                      onClick={() => switchMode("forgot")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-accent)",
                        fontSize: "var(--font-size-sm)",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {mode === "forgot" && (
                  <p
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "var(--font-size-sm)",
                      marginBottom: "var(--space-md)",
                    }}
                  >
                    Enter your email and we&apos;ll send you a link to reset
                    your password.
                  </p>
                )}

                <button
                  className="btn btn-primary register-btn"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "⏳ Please wait..."
                    : mode === "signup"
                      ? "Get Started 🚀"
                      : mode === "signin"
                        ? "Sign In 🔑"
                        : "Send Reset Link 📧"}
                </button>

                {mode === "forgot" && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ width: "100%", marginTop: "var(--space-sm)" }}
                    onClick={() => switchMode("signin")}
                  >
                    ← Back to Sign In
                  </button>
                )}

                {/* Social login — visible on signup & signin only */}
                {mode !== "forgot" && (
                  <div className="social-login-section">
                    <div className="social-divider">
                      <span>or continue with</span>
                    </div>
                    <div className="social-buttons">
                      <button
                        type="button"
                        className="social-btn social-btn-google"
                        onClick={() => handleSocialLogin(googleProvider)}
                        disabled={submitting}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          aria-hidden="true"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Google
                      </button>
                      <button
                        type="button"
                        className="social-btn social-btn-facebook"
                        onClick={() => handleSocialLogin(facebookProvider)}
                        disabled={submitting}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="white"
                          aria-hidden="true"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </form>

          <div
            className="auth-footer"
            style={{
              textAlign: "center",
              marginTop: "var(--space-xl)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
            }}
          >
            <p>
              By continuing, you agree to our <br />
              <Link
                to="/privacy-policy"
                style={{ color: "var(--color-accent)", textDecoration: "none" }}
              >
                Privacy Policy
              </Link>{" "}
              &bull;{" "}
              <Link
                to="/data-deletion"
                style={{ color: "var(--color-accent)", textDecoration: "none" }}
              >
                Data Deletion
              </Link>
            </p>
          </div>
        </div>

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
