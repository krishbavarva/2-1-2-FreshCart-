import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createPaymentIntent, confirmPayment } from '../services/paymentService';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: currentUser?.user?.firstName || '',
    lastName: currentUser?.user?.lastName || '',
    address: currentUser?.user?.address || '',
    city: currentUser?.user?.city || '',
    zipCode: currentUser?.user?.zipCode || '',
    country: currentUser?.user?.country || 'France',
    phone: currentUser?.user?.phone || ''
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white">
        <div className="text-center rounded-2xl shadow-xl p-12 max-w-md bg-white border-2 border-gray-200">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-gray-100">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
      setPaymentProcessing(true);

      // Step 1: Create payment intent
      console.log('🔄 Creating payment intent...');
      const paymentData = await createPaymentIntent(shippingAddress);
      
      if (!paymentData.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      console.log('✅ Payment intent created:', paymentData.paymentIntentId);

      // Step 2: For testing, simulate payment success
      // In production, use Stripe.js Elements to collect card details
      // For now, we'll use a test mode that confirms the payment automatically
      
      // Note: In a real implementation, you would use Stripe.js to collect card details
      // and confirm the payment client-side. For testing without card details,
      // we can use Stripe test mode with test card numbers.
      
      // For now, confirm payment with the payment intent ID
      // This assumes payment was processed (in test mode you can use test cards)
      console.log('🔄 Confirming payment...');
      
      // Wait a moment to simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Confirm payment and create order
      const orderData = await confirmPayment(
        paymentData.paymentIntentId,
        shippingAddress,
        paymentMethod
      );

      console.log('✅ Order created:', orderData.order?.orderNumber);

      toast.success('Order placed successfully!');
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('❌ Checkout error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to place order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setCheckoutLoading(false);
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 relative bg-white">
      {/* Processing Overlay */}
      {paymentProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl shadow-lg p-6 bg-white border-2 border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Items ({cart.items.length})</h2>
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
                    className="flex gap-4 p-5 rounded-2xl hover:shadow-lg transition-all duration-300 group bg-gray-50 border border-gray-200"
                  >
                    <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow bg-white">
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
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      {item.brand && (
                        <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                      )}
                      <p className="text-lg font-bold text-blue-600">€{(item.price * item.quantity).toFixed(2)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 rounded-lg p-1 bg-gray-100 border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="w-9 h-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-200 flex items-center justify-center font-bold text-lg transition-all duration-200 shadow-sm hover:shadow-md text-gray-700"
                        >
                          −
                        </button>
                        <span className="w-14 text-center font-bold text-gray-900 text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-9 h-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-200 flex items-center justify-center font-bold text-lg transition-all duration-200 shadow-sm hover:shadow-md text-gray-700"
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
            <div className="rounded-2xl shadow-xl p-6 sticky top-8 bg-white border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {!showCheckout ? (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (10%)</span>
                      <span>€{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? <span className="font-semibold text-green-600">FREE</span> : `€${shipping.toFixed(2)}`}</span>
                    </div>
                    {subtotal < 50 && (
                      <p className="text-sm text-blue-600">
                        Add €{(50 - subtotal).toFixed(2)} more for free shipping!
                      </p>
                    )}
                    <div className="pt-3 mt-3 border-t border-gray-300">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span className="text-blue-600">€{total.toFixed(2)}</span>
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

                  {/* Payment Method Selection */}
                  <div className="space-y-3 mb-4">
                    <h3 className="font-semibold text-gray-900">Payment Method</h3>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-900">Credit/Debit Card</span>
                      </label>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <p className="text-xs text-blue-800">
                        <strong>⚠️ Test Mode:</strong> Currently in test mode - card details are not collected.
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        In production, you'll enter card details here before payment.
                      </p>
                      <p className="text-xs text-blue-600 mt-1 font-mono">
                        Test Card: 4242 4242 4242 4242 (Any future date, any CVC)
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-xl font-bold text-gray-900 mb-4">
                      <span>Total</span>
                      <span>€{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading || paymentProcessing}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed relative"
                    >
                      {paymentProcessing ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Payment...
                        </span>
                      ) : checkoutLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Placing Order...
                        </span>
                      ) : (
                        'Place Order'
                      )}
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

