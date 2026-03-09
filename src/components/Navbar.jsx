import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useStore } from '../store/useStore';
import './Navbar.css';
import logoImg from '../assets/logo_transparent.png';

export default function Navbar() {
  const { userProfile, cart } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  function isActive(path) {
    return location.pathname === path;
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  async function handleLogout() {
    await signOut(auth);
    setDropdownOpen(false);
    setMobileOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <img src={logoImg} alt="BarterTrader Logo" className="navbar-logo-img" />
        </Link>

        {/* Desktop nav links */}
        <div className="navbar-nav">
          <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
            📦 My Items
          </Link>
          <Link to="/marketplace" className={`navbar-link ${isActive('/marketplace') ? 'active' : ''}`}>
            🏪 Marketplace
          </Link>
          <Link to="/cart" className={`navbar-link ${isActive('/cart') ? 'active' : ''}`}>
            🛒 Cart
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </Link>
          <Link to="/trade-summary" className={`navbar-link ${isActive('/trade-summary') ? 'active' : ''}`}>
            📋 Summary
          </Link>
        </div>

        {/* User avatar dropdown (right side) */}
        {userProfile && (
          <div className="navbar-dropdown-wrapper" ref={dropdownRef}>
            <button
              className="navbar-avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="User menu"
            >
              <span className="navbar-avatar">
                {userProfile.name?.charAt(0).toUpperCase()}
              </span>
              <span className="navbar-avatar-caret">{dropdownOpen ? '▲' : '▼'}</span>
            </button>

            {dropdownOpen && (
              <div className="navbar-dropdown">
                <div className="navbar-dropdown-header">
                  <span className="navbar-dropdown-avatar">
                    {userProfile.name?.charAt(0).toUpperCase()}
                  </span>
                  <div className="navbar-dropdown-info">
                    <span className="navbar-dropdown-name">{userProfile.name}</span>
                    <span className="navbar-dropdown-phone">{userProfile.phone}</span>
                    <span className="navbar-dropdown-email">{userProfile.email}</span>
                  </div>
                </div>
                <div className="navbar-dropdown-divider" />
                <Link to="/profile" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  👤 My Profile
                </Link>
                <Link to={`/seller/${userProfile.id}`} className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  🏪 My Shop
                </Link>
                <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
            📦 My Items
          </Link>
          <Link to="/marketplace" className={`navbar-link ${isActive('/marketplace') ? 'active' : ''}`}>
            🏪 Marketplace
          </Link>
          <Link to="/cart" className={`navbar-link ${isActive('/cart') ? 'active' : ''}`}>
            🛒 Cart {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </Link>
          <Link to="/trade-summary" className={`navbar-link ${isActive('/trade-summary') ? 'active' : ''}`}>
            📋 Summary
          </Link>
          {userProfile && (
            <>
              <div className="navbar-dropdown-divider" />
              <div className="navbar-mobile-user">
                <span className="navbar-dropdown-avatar">
                  {userProfile.name?.charAt(0).toUpperCase()}
                </span>
                <div>
                  <span className="navbar-dropdown-name">{userProfile.name}</span>
                  <span className="navbar-dropdown-phone">{userProfile.phone}</span>
                </div>
              </div>
              <Link to="/profile" className="navbar-link">
                👤 My Profile
              </Link>
              <Link to={`/seller/${userProfile.id}`} className="navbar-link">
                🏪 My Shop
              </Link>
              <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
