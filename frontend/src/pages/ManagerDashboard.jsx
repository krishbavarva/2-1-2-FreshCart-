import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getManagerStockStats, getManagerOrders, updateOrderStatus, getManagerProducts, updateStock } from '../services/managerService';
import toast from 'react-hot-toast';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingStock, setEditingStock] = useState(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockOperation, setStockOperation] = useState('set');

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, productsData] = await Promise.all([
        getManagerStockStats(),
        getManagerOrders({ status: statusFilter !== 'all' ? statusFilter : undefined }),
        getManagerProducts({ limit: 10 })
      ]);
      setStats(statsData);
      setOrders(ordersData.orders || []);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId) => {
    if (!stockQuantity || isNaN(stockQuantity) || parseFloat(stockQuantity) < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      await updateStock(productId, {
        quantity: parseFloat(stockQuantity),
        operation: stockOperation
      });
      toast.success('Stock updated successfully');
      setEditingStock(null);
      setStockQuantity('');
      loadData();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      ordered: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatusColor = (stock) => {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock > 0 && stock < 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manager Dashboard</h1>
        <p className="text-gray-600">Manage products, stock, and orders</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats?.statistics?.inStock || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
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
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Value</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {formatCurrency(stats?.statistics?.totalStockValue || 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {(stats?.lowStockProducts?.length > 0 || stats?.outOfStockProducts?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.lowStockProducts?.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-yellow-800">Low Stock Alert</h3>
                <Link to="/admin/products?lowStock=true" className="text-yellow-700 hover:text-yellow-900 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-2">
                {stats.lowStockProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-3 rounded">
                    <span className="text-gray-800">{product.name}</span>
                    <span className="text-yellow-600 font-semibold">Stock: {product.stock}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.outOfStockProducts?.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-800">Out of Stock</h3>
                <Link to="/admin/products?status=out_of_stock" className="text-red-700 hover:text-red-900 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-2">
                {stats.outOfStockProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-3 rounded">
                    <span className="text-gray-800">{product.name}</span>
                    <span className="text-red-600 font-semibold">Stock: 0</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Products with Stock Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Products</h2>
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  {editingStock === product._id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={stockOperation}
                        onChange={(e) => setStockOperation(e.target.value)}
                        className="text-xs px-2 py-1 border rounded"
                      >
                        <option value="set">Set</option>
                        <option value="add">Add</option>
                        <option value="subtract">Subtract</option>
                      </select>
                      <input
                        type="number"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-sm"
                        min="0"
                      />
                      <button
                        onClick={() => handleStockUpdate(product._id)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingStock(null);
                          setStockQuantity('');
                        }}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(product.stock)}`}>
                        {product.stock} units
                      </span>
                      <button
                        onClick={() => {
                          setEditingStock(product._id);
                          setStockQuantity(product.stock.toString());
                          setStockOperation('set');
                        }}
                        className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                      >
                        Update
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/admin/products"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Products →
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1 border border-gray-300 rounded-lg"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{order.orderNumber}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{order.user?.firstName} {order.user?.lastName}</span>
                  <span className="font-medium">{formatCurrency(order.total)}</span>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                  className="mt-2 w-full text-xs px-2 py-1 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="ordered">Ordered</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            ))}
          </div>
          <Link
            to="/orders"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Orders →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          to="/orders"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Manage Orders</h3>
              <p className="text-blue-100">View and manage all orders</p>
            </div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </Link>

        <Link
          to="/admin/order"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Restock Items</h3>
              <p className="text-purple-100">Order new inventory</p>
            </div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ManagerDashboard;

