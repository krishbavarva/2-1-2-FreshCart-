import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LikedProductsProvider } from './contexts/LikedProductsContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import LikedProducts from './pages/LikedProducts';
import ProteinPlanBot from './pages/ProteinPlanBot';
import CustomerDashboard from './pages/CustomerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderNewItems from './pages/admin/OrderNewItems';
import UserManagement from './pages/admin/UserManagement';
import CreateUser from './pages/admin/CreateUser';
import AdminOrders from './pages/admin/AdminOrders';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import EmployeeRoute from './components/common/EmployeeRoute';
import ManagerRoute from './components/common/ManagerRoute';
import CustomerRoute from './components/common/CustomerRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <CartProvider>
            <LikedProductsProvider>
              <Layout>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route 
                    path="/products" 
                    element={
                      <ProtectedRoute>
                        <Products />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/cart" 
                    element={
                      <CustomerRoute>
                        <Cart />
                      </CustomerRoute>
                    } 
                  />
                  <Route 
                    path="/liked-products" 
                    element={
                      <ProtectedRoute>
                        <LikedProducts />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/protein-plan" 
                    element={
                      <ProtectedRoute>
                        <ProteinPlanBot />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/orders" 
                    element={
                      <ProtectedRoute>
                        <OrderHistory />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <CustomerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/employee" 
                    element={
                      <EmployeeRoute>
                        <EmployeeDashboard />
                      </EmployeeRoute>
                    } 
                  />
                  <Route 
                    path="/manager" 
                    element={
                      <ManagerRoute>
                        <ManagerDashboard />
                      </ManagerRoute>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/products" 
                    element={
                      <AdminRoute>
                        <ProductManagement />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/order" 
                    element={
                      <AdminRoute>
                        <OrderNewItems />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <AdminRoute>
                        <UserManagement />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users/create" 
                    element={
                      <AdminRoute>
                        <CreateUser />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/orders" 
                    element={
                      <AdminRoute>
                        <AdminOrders />
                      </AdminRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
              <Toaster position="top-right" />
            </Layout>
            </LikedProductsProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

