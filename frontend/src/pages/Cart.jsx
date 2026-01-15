import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../services/orderService';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: currentUser?.user?.firstName || '',
    lastName: currentUser?.user?.lastName || '',
    address: currentUser?.user?.address || '',
    city: currentUser?.user?.city || '',
    zipCode: currentUser?.user?.zipCode || '',
    country: currentUser?.user?.country || '',
    phone: currentUser?.user?.phone || ''
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center rounded-2xl shadow-xl p-12 max-w-md" style={{
          background: 'linear-gradient(135deg, #2d7a52 0%, #1e6b47 50%, #1a5f3f 100%)',
          border: '2px solid rgba(249, 115, 22, 0.4)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{
            background: 'rgba(255, 255, 255, 0.1)'
          }}>
            <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
          <p className="text-white/70 mb-8">Start shopping to add items to your cart</p>
          <button
            onClick={() => navigate('/products')}
            className="text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)'
            }}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.totalPrice || 0;
  const tax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const handleCheckout = async () => {
    if (!showCheckout) {
      setShowCheckout(true);
      return;
    }

    // Validate shipping address
    if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.address || 
        !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.country) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    try {
      setCheckoutLoading(true);
      const orderData = await createOrder({
        shippingAddress,
        paymentMethod: 'card'
      });
      toast.success('Order placed successfully!');
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 relative" style={{
      background: 'linear-gradient(135deg, #1a5f3f 0%, #2d7a52 25%, #1e6b47 50%, #2d7a52 75%, #1a5f3f 100%)'
    }}>
      <div className="container mx-auto max-w-6xl relative z-10">
        <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl shadow-lg p-6" style={{
              background: 'linear-gradient(135deg, #2d7a52 0%, #1e6b47 50%, #1a5f3f 100%)',
              border: '2px solid rgba(249, 115, 22, 0.4)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
            }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Items ({cart.items.length})</h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 p-5 rounded-2xl hover:shadow-lg transition-all duration-300 group"
                    style={{
                      background: 'linear-gradient(135deg, #1e6b47 0%, #2d7a52 100%)',
                      border: '1px solid rgba(249, 115, 22, 0.3)'
                    }}
                  >
                    <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow" style={{
                      background: 'linear-gradient(135deg, #1a5f3f 0%, #1e6b47 100%)'
                    }}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                      {item.brand && (
                        <p className="text-sm text-white/60 mb-2">{item.brand}</p>
                      )}
                      <p className="text-lg font-bold" style={{ color: '#f97316' }}>${(item.price * item.quantity).toFixed(2)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 rounded-lg p-1" style={{
                        background: 'rgba(26, 95, 63, 0.6)',
                        border: '1px solid rgba(249, 115, 22, 0.2)'
                      }}>
                        <button
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-lg transition-all duration-200 shadow-sm hover:shadow-md text-white"
                          style={{
                            background: 'rgba(26, 95, 63, 0.8)',
                            borderColor: 'rgba(249, 115, 22, 0.4)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f97316';
                            e.target.style.borderColor = '#f97316';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.borderColor = 'rgba(249, 115, 22, 0.3)';
                          }}
                        >
                          −
                        </button>
                        <span className="w-14 text-center font-bold text-white text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-lg transition-all duration-200 shadow-sm hover:shadow-md text-white"
                          style={{
                            background: 'rgba(26, 95, 63, 0.8)',
                            borderColor: 'rgba(249, 115, 22, 0.4)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f97316';
                            e.target.style.borderColor = '#f97316';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.borderColor = 'rgba(249, 115, 22, 0.3)';
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-700 text-sm font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl shadow-xl p-6 sticky top-8" style={{
              background: 'linear-gradient(135deg, #2d7a52 0%, #1e6b47 50%, #1a5f3f 100%)',
              border: '2px solid rgba(249, 115, 22, 0.4)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
            }}>
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              {!showCheckout ? (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-white/80">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Tax (10%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? <span className="font-semibold" style={{ color: '#f97316' }}>FREE</span> : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    {subtotal < 50 && (
                      <p className="text-sm" style={{ color: '#f97316' }}>
                        Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                      </p>
                    )}
                    <div className="pt-3 mt-3" style={{
                      borderTop: '1px solid rgba(249, 115, 22, 0.2)'
                    }}>
                      <div className="flex justify-between text-xl font-bold text-white">
                        <span>Total</span>
                        <span style={{ color: '#f97316' }}>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold text-gray-900">Shipping Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Address"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Zip Code"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Country"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-xl font-bold text-gray-900 mb-4">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checkoutLoading ? 'Placing Order...' : 'Place Order'}
                    </button>
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

