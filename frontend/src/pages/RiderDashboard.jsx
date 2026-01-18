import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRiderOrders, updateOrderStatus, getRiderStockStats } from '../services/riderService';
import toast from 'react-hot-toast';

const RiderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ordered');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, statsData] = await Promise.all([
        getRiderOrders({ status: statusFilter }),
        getRiderStockStats()
      ]);
      const orders = ordersData.orders || [];
      // Debug: Log order data to verify deliveryDistance and estimatedDeliveryTime
      if (orders.length > 0) {
        console.log('📦 Sample order data:', {
          orderId: orders[0]._id,
          deliveryDistance: orders[0].deliveryDistance,
          estimatedDeliveryTime: orders[0].estimatedDeliveryTime,
          deliveryFee: orders[0].deliveryFee,
          orderNumber: orders[0].orderNumber
        });
      }
      setOrders(orders);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load dashboard data';
      const statusCode = error.response?.status;
      
      if (statusCode === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (statusCode === 403) {
        toast.error('Access denied. You do not have permission to view this dashboard.');
      } else if (statusCode === 503) {
        toast.error('Database connection error. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      ordered: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return `€${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Rider Dashboard</h1>
        <p className="text-gray-600">Manage deliveries and view order details for delivery</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {orders.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ordered</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {orders.filter(o => o.status === 'ordered').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stock Items</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {stats?.statistics?.lowStock || 0}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
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
        </div>
      </div>

      {/* Stock Alerts */}
      {(stats?.lowStockProducts?.length > 0 || stats?.outOfStockProducts?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.lowStockProducts?.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">Low Stock Alert</h3>
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
              <h3 className="text-lg font-semibold text-red-800 mb-4">Out of Stock</h3>
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

      {/* Orders Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Delivery Orders</h2>
            <p className="text-sm text-gray-500 mt-1">Click on any order to view full delivery details</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ordered">Ordered</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium">{order.user?.firstName} {order.user?.lastName}</div>
                          <div className="text-xs text-gray-400">{order.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.shippingAddress ? (
                          <div className="max-w-xs">
                            <div className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                            <div className="text-xs truncate">{order.shippingAddress.address}</div>
                            <div className="text-xs">{order.shippingAddress.city}, {order.shippingAddress.zipCode}</div>
                            {order.shippingAddress.phone && (
                              <div className="text-xs text-blue-600">📞 {order.shippingAddress.phone}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No address</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.deliveryDistance ? (
                          <div>
                            <div className="font-medium text-blue-600">{order.deliveryDistance} km</div>
                            <div className="text-xs text-gray-400">Fee: €{order.deliveryFee?.toFixed(2) || '0.00'}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.estimatedDeliveryTime ? (
                          <div className="font-medium text-green-600">{order.estimatedDeliveryTime} min</div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updatingStatus === order._id}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="ordered">Ordered</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                    {expandedOrder === order._id && (
                      <tr className="bg-blue-50">
                        <td colSpan="8" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Order Items ({order.items?.length || 0})</h4>
                              <div className="space-y-2">
                                {order.items?.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center bg-white p-2 rounded text-sm">
                                    <div>
                                      <span className="font-medium">{item.name}</span>
                                      {item.brand && <span className="text-gray-500 ml-2">({item.brand})</span>}
                                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                                    </div>
                                    <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t border-gray-300">
                                <div className="flex justify-between text-sm">
                                  <span>Subtotal:</span>
                                  <span className="font-medium">€{order.subtotal?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Tax:</span>
                                  <span className="font-medium">€{order.tax?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Delivery Fee:</span>
                                  <span className="font-medium">€{order.deliveryFee?.toFixed(2) || order.shipping?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-300">
                                  <span>Total:</span>
                                  <span>€{order.total?.toFixed(2) || '0.00'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Delivery Details */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Delivery Information</h4>
                              {order.shippingAddress && (
                                <div className="bg-white p-4 rounded-lg mb-4">
                                  <h5 className="font-medium text-gray-700 mb-2">Delivery Address</h5>
                                  <p className="text-sm text-gray-600">
                                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                                    {order.shippingAddress.address}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.zipCode}<br />
                                    {order.shippingAddress.country}
                                    {order.shippingAddress.phone && (
                                      <>
                                        <br />
                                        <span className="text-blue-600">📞 {order.shippingAddress.phone}</span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              )}
                              {order.deliveryDistance && (
                                <div className="bg-white p-4 rounded-lg space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Distance:</span>
                                    <span className="font-medium text-blue-600">{order.deliveryDistance} km</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Delivery Fee:</span>
                                    <span className="font-medium">€{order.deliveryFee?.toFixed(2) || '0.00'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Estimated Time:</span>
                                    <span className="font-medium text-green-600">{order.estimatedDeliveryTime} minutes</span>
                                  </div>
                                  {order.storeAddress && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <span className="text-xs text-gray-500">Store: {order.storeAddress.fullAddress || `${order.storeAddress.street}, ${order.storeAddress.city}`}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="mt-4 text-xs text-gray-500">
                                <p>Order Date: {formatDate(order.createdAt)}</p>
                                {order.updatedAt && order.updatedAt !== order.createdAt && (
                                  <p>Last Updated: {formatDate(order.updatedAt)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/products"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">View Products</h3>
              <p className="text-blue-100">Browse product catalog</p>
            </div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </Link>

        <Link
          to="/orders"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">All Orders</h3>
              <p className="text-blue-100">View all customer orders</p>
            </div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default RiderDashboard;

