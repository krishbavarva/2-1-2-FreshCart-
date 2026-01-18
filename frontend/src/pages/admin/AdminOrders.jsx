import React, { useState, useEffect } from 'react';
import { getAllOrders } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const data = await getAllOrders(params);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      ordered: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 relative bg-white">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Orders</h1>
          <p className="text-gray-600">View and manage all customer orders</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="ordered">Ordered</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl shadow-xl p-12 text-center bg-white border-2 border-gray-200">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-gray-100">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No orders found</h2>
            <p className="text-gray-600 mb-8">No customer orders match your filter criteria</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-2 border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-300">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h3>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Customer: {order.user?.firstName} {order.user?.lastName} ({order.user?.email})
                    </p>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="text-2xl font-bold text-blue-600">€{order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Items ({order.items.length})</h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-xl transition-all duration-200 bg-gray-50 border border-gray-200">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md bg-white">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          {item.brand && (
                            <p className="text-sm text-gray-600">{item.brand}</p>
                          )}
                          <p className="text-sm text-gray-700">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">€{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 && (
                  <div className="pt-4 border-t border-gray-300">
                    <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                    <p className="text-sm text-gray-700">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.zipCode}<br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                )}

                {order.deliveryDistance && (
                  <div className="pt-4 border-t border-gray-300">
                    <h4 className="font-semibold text-gray-900 mb-2">Delivery Information</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Distance</p>
                        <p className="font-medium text-gray-900">{order.deliveryDistance} km</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Delivery Fee</p>
                        <p className="font-medium text-gray-900">€{order.deliveryFee?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Est. Time</p>
                        <p className="font-medium text-gray-900">{order.estimatedDeliveryTime} min</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 flex justify-between text-sm border-t border-gray-300">
                  <div>
                    <span className="text-gray-600">Subtotal: </span>
                    <span className="font-medium text-gray-900">€{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tax: </span>
                    <span className="font-medium text-gray-900">€{order.tax.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Delivery Cost: </span>
                    <span className="font-medium text-green-600">{order.shipping === 0 ? 'FREE' : `€${order.shipping.toFixed(2)}`}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-gray-700 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors font-medium"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;


