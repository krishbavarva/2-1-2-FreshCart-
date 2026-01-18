import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { TEST_CARDS } from '../../config/stripe';

const CheckoutForm = ({ clientSecret, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('🔍 CheckoutForm state:', {
      hasStripe: !!stripe,
      hasElements: !!elements,
      hasClientSecret: !!clientSecret,
      clientSecretLength: clientSecret?.length,
      isReady: isPaymentElementReady,
      loadError: loadError
    });
    
    // Validate clientSecret format
    if (clientSecret && !clientSecret.startsWith('pi_') && !clientSecret.includes('secret')) {
      console.warn('⚠️ Client secret format might be incorrect. Expected format: pi_xxx_secret_xxx');
    }
  }, [stripe, elements, clientSecret, isPaymentElementReady, loadError]);

  useEffect(() => {
    if (!stripe) {
      console.log('⏳ Waiting for Stripe to load...');
      return;
    }

    if (!clientSecret) {
      console.log('⏳ Waiting for client secret...');
      return;
    }

    console.log('🔍 Retrieving payment intent...', clientSecret.substring(0, 20) + '...');
    stripe.retrievePaymentIntent(clientSecret)
      .then((result) => {
        // Handle both { paymentIntent } and direct paymentIntent response
        const paymentIntent = result.paymentIntent || result;
        
        if (!paymentIntent) {
          console.warn('⚠️ Payment intent is undefined in response');
          return;
        }
        
        console.log('✅ Payment intent retrieved:', paymentIntent.status);
        switch (paymentIntent.status) {
          case 'succeeded':
            setMessage('Payment succeeded!');
            break;
          case 'processing':
            setMessage('Your payment is processing.');
            break;
          case 'requires_payment_method':
            setMessage('Your payment was not successful, please try again.');
            break;
          default:
            setMessage('Something went wrong.');
            break;
        }
      })
      .catch((error) => {
        console.error('❌ Error retrieving payment intent:', error);
        console.error('Error details:', {
          message: error.message,
          type: error.type,
          code: error.code,
          error: error
        });
        // Don't set error message for retrieval errors - just log it
        // The PaymentElement will handle its own errors
      });
  }, [stripe, clientSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error('Payment system is not ready. Please wait a moment and try again.');
      return;
    }

    // Check if PaymentElement is mounted
    if (!isPaymentElementReady) {
      toast.error('Payment form is still loading. Please wait a moment.');
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
        setMessage(error.message || 'Payment failed. Please try again.');
        toast.error(error.message || 'Payment failed. Please try again.');
        if (onError) onError(error);
      } else if (paymentIntent) {
        console.log('Payment intent status:', paymentIntent.status);
        if (paymentIntent.status === 'succeeded') {
          setMessage('Payment succeeded!');
          toast.success('Payment successful!');
          if (onSuccess) onSuccess(paymentIntent);
        } else if (paymentIntent.status === 'processing') {
          setMessage('Your payment is processing.');
          toast.success('Payment is processing...');
          if (onSuccess) onSuccess(paymentIntent);
        } else {
          setMessage(`Payment status: ${paymentIntent.status}`);
        }
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      const errorMessage = err.message || 'An error occurred during payment. Please try again.';
      setMessage(errorMessage);
      toast.error(errorMessage);
      if (onError) onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Card Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">🧪 Test Mode - Use Test Cards</h3>
        <div className="text-xs text-blue-800 space-y-1">
          <p><strong>Success:</strong> {TEST_CARDS.success.number} (any future date, any CVC)</p>
          <p><strong>Decline:</strong> {TEST_CARDS.decline.number} (any future date, any CVC)</p>
          <p><strong>3D Secure:</strong> {TEST_CARDS.requiresAuth.number} (any future date, any CVC)</p>
        </div>
      </div>

      {!stripe && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            ⏳ Loading Stripe payment system...
          </p>
        </div>
      )}

      {!clientSecret && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">
            ❌ Payment intent not initialized. Please try again.
          </p>
        </div>
      )}

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm font-semibold mb-2">❌ Payment Form Error:</p>
          <p className="text-red-700 text-xs mb-2">{loadError}</p>
          <div className="bg-red-100 border border-red-300 rounded p-3 mt-3">
            <p className="text-red-900 text-xs font-semibold mb-1">🔍 Debug Information:</p>
            <ul className="text-red-800 text-xs space-y-1 list-disc list-inside">
              <li>Stripe loaded: {stripe ? '✅ Yes' : '❌ No'}</li>
              <li>Elements ready: {elements ? '✅ Yes' : '❌ No'}</li>
              <li>Client secret: {clientSecret ? `✅ ${clientSecret.substring(0, 20)}...` : '❌ Missing'}</li>
            </ul>
            <p className="text-red-700 text-xs mt-2">
              💡 <strong>Please check browser console (F12)</strong> for detailed error messages.
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                setLoadError(null);
                setIsPaymentElementReady(false);
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                setLoadError(null);
                setIsPaymentElementReady(false);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {stripe && clientSecret && !loadError && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-300 rounded-lg p-4 relative min-h-[200px]">
            {!isPaymentElementReady && !loadError && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading payment form...</p>
                  <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
                </div>
              </div>
            )}
            {!loadError && (
              <PaymentElement 
                key={clientSecret} // Force re-render when clientSecret changes
                options={{
                  layout: 'tabs',
                  business: {
                    name: 'FreshCart'
                  }
                }}
                onReady={() => {
                  console.log('✅ PaymentElement is ready');
                  setIsPaymentElementReady(true);
                  setLoadError(null);
                }}
                onLoadError={(error) => {
                  console.error('❌ PaymentElement load error:', error);
                  console.error('Error details:', {
                    message: error.message,
                    type: error.type,
                    code: error.code,
                    error: error,
                    stripeReady: !!stripe,
                    elementsReady: !!elements,
                    clientSecretValid: !!clientSecret && clientSecret.length > 0,
                    clientSecretPrefix: clientSecret?.substring(0, 20) + '...',
                    clientSecretLength: clientSecret?.length
                  });
                  
                  // Check for 401 Unauthorized error (key mismatch)
                  const errorStr = JSON.stringify(error).toLowerCase();
                  if (errorStr.includes('401') || errorStr.includes('unauthorized')) {
                    console.error('');
                    console.error('🔴 CRITICAL: 401 Unauthorized Error!');
                    console.error('   Your Stripe publishable key does NOT match your secret key!');
                    console.error('   Secret key: sk_test_51SqroIQ1lh1OBKoTJMLoFJebo...');
                    console.error('   Current publishable: pk_test_51SqroIQ1lh1OBKoTbmb4kahUM... (WRONG!)');
                    console.error('   Expected publishable: pk_test_51SqroIQ1lh1OBKoTJMLoFJebo...');
                    console.error('');
                    console.error('🔧 FIX:');
                    console.error('   1. Go to: https://dashboard.stripe.com/test/apikeys');
                    console.error('   2. Find the publishable key that matches your secret key');
                    console.error('   3. Update frontend/src/config/stripe.js');
                    console.error('   4. Restart frontend server');
                    console.error('');
                  }
                  
                  // More detailed error message
                  let errorMsg = 'Failed to load payment form. ';
                  if (error.message) {
                    errorMsg += error.message;
                  } else if (errorStr.includes('401') || errorStr.includes('unauthorized')) {
                    errorMsg += 'Your Stripe publishable key is invalid or does not match your secret key. Please check your Stripe configuration.';
                  } else if (!stripe) {
                    errorMsg += 'Stripe is not loaded. Please check your internet connection.';
                  } else if (!elements) {
                    errorMsg += 'Payment elements are not ready.';
                  } else if (!clientSecret) {
                    errorMsg += 'Payment intent is missing.';
                  } else {
                    errorMsg += 'Please check your Stripe configuration and try again.';
                  }
                  
                  setMessage(errorMsg);
                  setLoadError(errorMsg);
                  setIsPaymentElementReady(false);
                  toast.error(errorMsg);
                }}
                onUnmount={() => {
                  console.log('⚠️ PaymentElement unmounted');
                  setIsPaymentElementReady(false);
                }}
              />
            )}
          </div>
        
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('succeeded') || message.includes('processing')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || !elements || !isPaymentElementReady || isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Pay €${amount.toFixed(2)}`
          )}
        </button>
      </form>
      )}
    </div>
  );
};

export default CheckoutForm;

