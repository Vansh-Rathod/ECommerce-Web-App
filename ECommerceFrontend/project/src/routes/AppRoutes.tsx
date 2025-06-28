import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import SellerLayout from '../layouts/SellerLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import VerifyOtp from '../pages/auth/VerifyOtp';

// Lazy-loaded pages
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const CustomerDashboard = lazy(() => import('../pages/customer/Dashboard'));
const ProductList = lazy(() => import('../pages/customer/ProductList'));
const OrdersPage = lazy(() => import('../pages/customer/Orders'));
const CartPage = lazy(() => import('../pages/cart/CartPage'));
const Checkout = lazy(() => import('../pages/cart/Checkout'));
const WalletPage = lazy(() => import('../pages/wallet/WalletPage'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const UsersList = lazy(() => import('../pages/admin/UsersList'));
const CustomersList = lazy(() => import('../pages/admin/CustomersList'));
const SellersList = lazy(() => import('../pages/admin/SellersList'));
const ApprovalsList = lazy(() => import('../pages/admin/ApprovalList'));
const SellerDashboard = lazy(() => import('../pages/seller/Dashboard'));
const SellerProducts = lazy(() => import('../pages/seller/Products'));
const SellerOrders = lazy(() => import('../pages/seller/Orders'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/customer/products" />} />
        
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
        </Route>
        
        {/* Customer Routes */}
        <Route element={<PrivateRoute allowedRoles={['customer']} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/customer" element={<Navigate to="/customer/dashboard" />} />
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/products" element={<ProductList />} />
            <Route path="customer/orders" element={<OrdersPage  />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wallet" element={<WalletPage />} />
          </Route>
        </Route>
        
        {/* Admin Routes */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersList />} />
            <Route path="/admin/customers" element={<CustomersList />} />
            <Route path="/admin/sellers" element={<SellersList />} />
            <Route path="/admin/approvals" element={<ApprovalsList />} />
          </Route>
        </Route>
        
        {/* Seller Routes */}
        <Route element={<PrivateRoute allowedRoles={['seller']} />}>
          <Route element={<SellerLayout />}>
            <Route path="/seller" element={<Navigate to="/seller/dashboard" />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
          </Route>
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;