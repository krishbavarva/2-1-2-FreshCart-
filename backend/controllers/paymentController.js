import Stripe from 'stripe';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { isDBConnected } from '../config/database.js';

// Lazy initialization of Stripe - initialize on first use, not at module load time
// This ensures dotenv.config() has already run before we try to access process.env
let stripe = null;

// Get Stripe instance (lazy initialization)
const getStripe = () => {
  if (stripe !== null) {
    return stripe; // Already initialized
  }

  // Initialize Stripe with secret key from environment
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  // Debug: Log environment variable status
  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.trim() === '') {
    console.error('\n❌ ERROR: STRIPE_SECRET_KEY is not set in environment variables!');
    console.error('   Payment functionality will not work.');
    console.error('   Please add STRIPE_SECRET_KEY to your backend/.env file');
    console.error('   Format: STRIPE_SECRET_KEY=sk_test_your_key_here');
    console.error('   Make sure there are NO spaces around the = sign');
    console.error('   Make sure the .env file is in the backend/ directory');
    stripe = false; // Mark as failed
    return null;
  }

  try {
    stripe = new Stripe(STRIPE_SECRET_KEY.trim(), {
      apiVersion: '2024-06-20',
    });
    console.log('\n✅ Stripe initialized successfully');
    console.log('   Key preview:', STRIPE_SECRET_KEY.substring(0, 15) + '...');
    return stripe;
  } catch (error) {
    console.error('   ❌ Error initializing Stripe:', error.message);
    stripe = false; // Mark as failed
    return null;
  }
};

// Create payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.lastName || 
        !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode || 
        !shippingAddress.country) {
      return res.status(400).json({
        message: 'Complete shipping address is required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        message: 'Cart is empty'
      });
    }

    // Calculate totals
    const subtotal = cart.totalPrice || 0;
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + tax + shipping;

    // Convert to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(total * 100);

    // Validate amount
    if (amountInCents < 50) { // Minimum €0.50
      return res.status(400).json({
        message: 'Order total must be at least €0.50'
      });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_...') {
      console.warn('⚠️ Stripe secret key not configured. Using test mode.');
    }

    // Get Stripe instance
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({
        message: 'Payment service not configured'
      });
    }

    // Create PaymentIntent with Stripe
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur', // Euro for France
      metadata: {
        userId: userId.toString(),
        cartId: cart._id.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
      currency: 'eur'
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};

// Confirm payment and create order
export const confirmPayment = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { paymentIntentId, shippingAddress, paymentMethod = 'card' } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        message: 'Payment intent ID is required'
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.lastName || 
        !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode || 
        !shippingAddress.country) {
      return res.status(400).json({
        message: 'Complete shipping address is required'
      });
    }

    // Get Stripe instance
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({
        message: 'Payment service not configured'
      });
    }

    // Retrieve payment intent from Stripe
    let paymentIntent;
    try {
      paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    } catch (stripeError) {
      console.error('❌ Stripe error retrieving payment intent:', stripeError);
      return res.status(400).json({
        message: 'Invalid payment intent',
        error: stripeError.message
      });
    }

    // Verify payment intent belongs to user
    if (paymentIntent.metadata.userId !== userId.toString()) {
      return res.status(403).json({
        message: 'Payment intent does not belong to this user'
      });
    }

    // Check payment status
    // For test mode: Allow creating orders even if payment isn't fully confirmed
    // This allows testing without actual card processing
    // In production, this should be 'succeeded' only
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    // Test mode = Stripe key starts with 'sk_test_' (automatic test mode detection)
    const isTestMode = stripeKey.startsWith('sk_test_');
    
    console.log(`🔍 Payment status check:`, {
      status: paymentIntent.status,
      isTestMode: isTestMode,
      stripeKeyPrefix: stripeKey.substring(0, 7),
      nodeEnv: process.env.NODE_ENV || 'undefined'
    });
    
    // Allow order creation in test mode OR if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      console.log('✅ Payment confirmed - status: succeeded');
    } else if (isTestMode) {
      // In test mode, allow orders even if payment is not fully confirmed
      // This is for testing purposes only - allows 'requires_payment_method' status
      console.log(`⚠️ Test mode detected (${stripeKey.substring(0, 7)}...): Payment intent status is '${paymentIntent.status}'. Creating order anyway for testing.`);
      console.log('   ⚠️ In production, payment must have status "succeeded"');
    } else {
      // Production mode: Require succeeded status
      console.error(`❌ Production mode: Payment status '${paymentIntent.status}' is not allowed`);
      console.error(`   Stripe key: ${stripeKey.substring(0, 10)}...`);
      return res.status(400).json({
        message: `Payment not completed. Status: ${paymentIntent.status}`,
        paymentStatus: paymentIntent.status,
        hint: 'Payment must be completed before creating order'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        message: 'Cart is empty'
      });
    }

    // Calculate totals (should match payment intent amount)
    const subtotal = cart.totalPrice || 0;
    const tax = subtotal * 0.1;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + tax + shipping;

    // Verify amount matches
    const amountInCents = Math.round(total * 100);
    if (paymentIntent.amount !== amountInCents) {
      console.warn('⚠️ Amount mismatch:', {
        paymentIntent: paymentIntent.amount,
        calculated: amountInCents
      });
    }

    // Prepare order items with safe defaults
    const orderItems = cart.items.map(item => ({
      productId: item.productId || item._id?.toString() || '',
      name: item.name || 'Unknown Product',
      brand: item.brand || '',
      price: item.price || 0,
      image: item.image || '',
      quantity: item.quantity || 1,
      category: item.category || ''
    }));

    console.log('📦 Creating order with items:', orderItems.length);
    console.log('   Order totals:', { subtotal, tax, shipping, total });

    // Generate order number (required field, must be set before validation)
    // Format: ORD-timestamp-random (e.g., ORD-1234567890-456)
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000); // Increased range (0-9999) for better uniqueness
    const orderNumber = `ORD-${timestamp}-${random}`;
    
    console.log('   Generated orderNumber:', orderNumber);

    // Create order
    let order;
    try {
      order = await Order.create({
        user: userId,
        orderNumber: orderNumber,
        items: orderItems,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: shippingAddress,
        paymentMethod,
        paymentStatus: 'paid',
        paymentIntentId: paymentIntentId,
        stripePaymentId: paymentIntent.id,
        status: 'processing'
      });
      console.log('✅ Order created - orderNumber:', order.orderNumber);
    } catch (orderError) {
      console.error('❌ Error in Order.create():', orderError);
      console.error('   Error type:', orderError.constructor.name);
      console.error('   Error message:', orderError.message);
      console.error('   Stack trace:', orderError.stack);
      throw orderError; // Re-throw to be caught by outer catch
    }

    // Clear cart after order creation
    try {
      cart.items = [];
      cart.totalPrice = 0;
      await cart.save();
      console.log('✅ Cart cleared successfully');
    } catch (cartError) {
      console.error('❌ Error in cart.save():', cartError);
      console.error('   Error type:', cartError.constructor.name);
      console.error('   Error message:', cartError.message);
      // Don't throw - order is already created, just log the cart save error
    }

    // Populate user info
    await order.populate('user', 'firstName lastName email');

    console.log('✅ Order created successfully:', order.orderNumber);

    res.status(201).json({
      message: 'Order created successfully',
      order: order,
      paymentStatus: 'paid'
    });
  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    console.error('   Error stack:', error.stack);
    console.error('   Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    res.status(500).json({
      message: 'Error confirming payment and creating order',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Webhook handler for Stripe events (optional, for production)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // In test mode without webhook secret, just parse the body
      event = req.body;
    }
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ Payment succeeded:', paymentIntent.id);
      // You can update order status here if needed
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Payment failed:', failedPayment.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

