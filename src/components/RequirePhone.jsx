import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function RequirePhone() {
  const { userProfile, loading } = useStore();

  if (loading) return null;

  // If the user has no phone number, force them to the profile page
  if (userProfile && !userProfile.phone?.trim()) {
    return <Navigate to="/profile?forced=true" replace />;
  }

  // Otherwise, render the requested route
  return <Outlet />;
}
