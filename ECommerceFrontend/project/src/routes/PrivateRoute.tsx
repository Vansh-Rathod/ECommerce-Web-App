import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { hasUncaughtExceptionCaptureCallback } from 'process';
import { message, notification } from 'antd';

interface PrivateRouteProps {
  allowedRoles?: Array<string>;
}

const PrivateRoute = ({ allowedRoles = [] }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  
  // console.log(isAuthenticated);
  // console.log(user);
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRoles: string[] = user?.roles || [];

  // Check if user has at least one allowed role
  const hasAccess = allowedRoles.length === 0 || allowedRoles.some(role => userRoles.includes(role));
  
  // Check for role-based access if roles are specified
  if (!hasAccess) {
    // Redirect to appropriate dashboard based on role
    if (userRoles.includes('admin')) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRoles.includes('seller')) {
      return <Navigate to="/seller/dashboard" replace />;
    } else if (userRoles.includes('customer')) {
      return <Navigate to="/customer/dashboard" replace />;
    } else {
      return <Navigate to="/not-authorized" replace />;
    }
  }
  
  // User is authenticated and has permission
  return <Outlet />;
};

export default PrivateRoute;