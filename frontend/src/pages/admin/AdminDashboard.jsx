import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStockStats } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getStockStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Show more detailed error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load statistics';
      toast.error(`Failed to load statistics: ${errorMessage}`);
      
      // Set default stats to prevent UI breaking
      setStats({
        statistics: {
          totalProducts: 0,
          outOfStock: 0,
          lowStock: 0,
          inStock: 0,
          totalStockValue: 0
        },
        lowStockProducts: [],
        outOfStockProducts: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  // Show message if no stats loaded and there was an error
  const hasError = !stats || (stats?.statistics?.totalProducts === 0 && !loading);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your inventory and orders</p>
      </div>

      {/* Error or Empty State Message */}
      {hasError && stats?.statistics?.totalProducts === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">No Products Found</h3>
                <p className="text-yellow-700 mt-1">The database doesn't have any products yet. Please sync products from the API.</p>
              </div>
            </div>
            <button
              onClick={loadStats}
              className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
          <div className="mt-4 text-sm text-yellow-700">
            <p className="font-semibold mb-2">To sync products, run:</p>
            <code className="bg-yellow-100 px-3 py-1 rounded block">
              npm run sync-products
            </code>
            <p className="mt-2">Or if using Docker:</p>
            <code className="bg-yellow-100 px-3 py-1 rounded block">
              docker compose exec backend npm run sync-products
            </code>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats?.statistics?.totalProducts || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Stock</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats?.statistics?.inStock || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <Link
          to="/admin/products?lowStock=true"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats?.statistics?.lowStock || 0}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/products?outOfStock=true"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stats?.statistics?.outOfStock || 0}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Total Stock Value */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Total Stock Value</h2>
        <p className="text-4xl font-bold text-blue-600">
          ${(stats?.statistics?.totalStockValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/products"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Manage Products</h3>
              <p className="text-blue-100">View and manage product inventory</p>
            </div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </Link>

        <Link
          to="/admin/order"
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Order New Items</h3>
              <p className="text-green-100">Place orders to restock inventory</p>
            </div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Customer Orders</h3>
              <p className="text-purple-100">View and manage customer orders</p>
            </div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Additional Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/admin/users"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">User Management</h3>
              <p className="text-indigo-100">Create and manage user accounts</p>
            </div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Low Stock Section (< 30) */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-yellow-800">Low Stock Alert (Stock &lt; 30)</h3>
            </div>
            <Link
              to="/admin/products?lowStock=true"
              className="text-yellow-700 hover:text-yellow-900 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {stats.lowStockProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                <span className="text-gray-800 font-medium">{product.name}</span>
                <span className="text-yellow-600 font-semibold">
                  Stock: {product.stock} (Threshold: 30)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Out of Stock Section (0) */}
      {stats?.outOfStockProducts && stats.outOfStockProducts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h3 className="text-lg font-semibold text-red-800">Out of Stock Items</h3>
            </div>
            <Link
              to="/admin/products?status=out_of_stock"
              className="text-red-700 hover:text-red-900 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {stats.outOfStockProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                <span className="text-gray-800 font-medium">{product.name}</span>
                <span className="text-red-600 font-semibold">
                  Stock: {product.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


