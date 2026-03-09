import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store/useStore';
import Navbar from './components/Navbar';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import AddItemPage from './pages/AddItemPage';
import ItemDetailPage from './pages/ItemDetailPage';
import EditItemPage from './pages/EditItemPage';
import TradeSummaryPage from './pages/TradeSummaryPage';
import CartPage from './pages/CartPage';
import TradeConfirmationPage from './pages/TradeConfirmationPage';
import SellerPage from './pages/SellerPage';
import ProfilePage from './pages/ProfilePage';
import RequirePhone from './components/RequirePhone';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import UserDataDeletionPage from './pages/UserDataDeletionPage';

function AppRoutes() {
  const { user, loading } = useStore();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading BarterTrader...</p>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/data-deletion" element={<UserDataDeletionPage />} />

        {/* Authenticated Routes */}
        {user ? (
          <>
            <Route path="/profile" element={<ProfilePage />} />
            <Route element={<RequirePhone />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/add" element={<AddItemPage />} />
              <Route path="/item/:id" element={<ItemDetailPage />} />
              <Route path="/edit/:id" element={<EditItemPage />} />
              <Route path="/trade-summary" element={<TradeSummaryPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/trade/:tradeId" element={<TradeConfirmationPage />} />
              <Route path="/seller/:userId" element={<SellerPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <Route path="*" element={<RegisterPage />} />
        )}
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}
