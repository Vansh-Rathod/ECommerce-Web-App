import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = () => {
  const { isAuthenticated, user, activeRole } = useAuth();
  const location = useLocation();
  
  // If user is already authenticated, redirect to their role-specific dashboard

  if (isAuthenticated && user) {
    // Get the intended destination or default to role-based dashboard
    const from = location.state?.from?.pathname || getRoleBasedRoute(activeRole);
    return <Navigate to={from} replace />;
  }
  
  // User is not authenticated, allow access to public route
  return <Outlet />;
};

// Helper function to determine dashboard based on user role
const getRoleBasedRoute = (role: string | null) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'seller':
      return '/seller/dashboard';
    case 'customer':
      return '/customer/dashboard';
    default:
      return '/login';
  }
};

export default PublicRoute;