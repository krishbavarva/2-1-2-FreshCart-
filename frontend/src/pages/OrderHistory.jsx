import React, { useState, useEffect } from 'react';
import { getOrders, cancelOrder } from '../services/orderService';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders(page, 10);
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await cancelOrder(orderId);
      toast.success('Order cancelled');
      loadOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 relative" style={{
      background: 'linear-gradient(135deg, #1a5f3f 0%, #2d7a52 25%, #1e6b47 50%, #2d7a52 75%, #1a5f3f 100%)'
    }}>
      <div className="container mx-auto max-w-6xl relative z-10">
        <h1 className="text-4xl font-bold text-white mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="rounded-2xl shadow-lg p-12 text-center" style={{
            background: 'linear-gradient(135deg, #2d7a52 0%, #1e6b47 50%, #1a5f3f 100%)',
            border: '2px solid rgba(249, 115, 22, 0.4)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
          }}>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{
              background: 'rgba(255, 255, 255, 0.1)'
            }}>
              <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">No orders yet</h2>
            <p className="text-white/70 mb-8">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" style={{
                background: 'linear-gradient(135deg, #2d7a52 0%, #1e6b47 50%, #1a5f3f 100%)',
                border: '2px solid rgba(249, 115, 22, 0.4)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
              }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold text-white">Order #{order.orderNumber}</h3>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-white/70">
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
                    <p className="text-2xl font-bold" style={{ color: '#f97316' }}>${order.total.toFixed(2)}</p>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="mt-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-white mb-3">Items ({order.items.length})</h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-xl transition-all duration-200" style={{
                        background: 'rgba(26, 95, 63, 0.6)',
                        border: '1px solid rgba(249, 115, 22, 0.2)'
                      }}>
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md" style={{
                          background: 'linear-gradient(135deg, #1a5f3f 0%, #1e6b47 100%)'
                        }}>
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
                          <h5 className="font-medium text-white">{item.name}</h5>
                          {item.brand && (
                            <p className="text-sm text-white/60">{item.brand}</p>
                          )}
                          <p className="text-sm text-white/70">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 && (
                  <div className="pt-4" style={{
                    borderTop: '1px solid rgba(249, 115, 22, 0.2)'
                  }}>
                    <h4 className="font-semibold text-white mb-2">Shipping Address</h4>
                    <p className="text-sm text-white/70">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.zipCode}<br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 flex justify-between text-sm" style={{
                  borderTop: '1px solid rgba(249, 115, 22, 0.2)'
                }}>
                  <div>
                    <span className="text-white/70">Subtotal: </span>
                    <span className="font-medium text-white">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-white/70">Tax: </span>
                    <span className="font-medium text-white">${order.tax.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-white/70">Shipping: </span>
                    <span className="font-medium" style={{ color: order.shipping === 0 ? '#f97316' : 'white' }}>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
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

export default OrderHistory;

