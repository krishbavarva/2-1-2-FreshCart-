import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import mongoose from 'mongoose';
import { isDBConnected } from '../config/database.js';
import { generateReceipt, generateReceiptPDF } from '../services/receiptService.js';

// Create order from cart
export const createOrder = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    const userId = req.user.id;
    const { shippingAddress, paymentMethod = 'card' } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: 'Cart is empty'
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

    // Calculate totals
    const subtotal = cart.totalPrice || 0;
    const tax = subtotal * 0.1; // 10% tax (French VAT would be ~20%, but using 10% for now)
    const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over €50
    const total = subtotal + tax + shipping;

    // Generate order number (required field)
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order
    const order = await Order.create({
      user: userId,
      orderNumber: orderNumber,
      items: cart.items.map(item => ({
        productId: item.productId,
        name: item.name,
        brand: item.brand,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        category: item.category
      })),
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress: shippingAddress,
      paymentMethod,
      paymentStatus: 'pending', // Will be updated after payment confirmation
      status: 'pending'
    });

    // Clear cart after order creation
    cart.items = [];
    await cart.save();

    await order.populate('user', 'firstName lastName email');

    res.status(201).json({
      message: 'Order created successfully',
      order: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get user's orders
export const getOrders = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'firstName lastName email');

    const total = await Order.countDocuments({ user: userId });

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.json({
      order: order
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Check if order was created within the last 5 minutes
    const orderCreatedAt = new Date(order.createdAt);
    const now = new Date();
    const minutesSinceCreation = (now - orderCreatedAt) / (1000 * 60); // Convert to minutes

    if (minutesSinceCreation > 5) {
      return res.status(400).json({
        message: 'Order can only be cancelled within 5 minutes of placement',
        minutesSinceCreation: Math.round(minutesSinceCreation * 10) / 10
      });
    }

    order.status = 'cancelled';
    await order.save();
    await order.populate('user', 'firstName lastName email');

    res.json({
      message: 'Order cancelled',
      order: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// Get receipt/invoice for an order
export const getReceipt = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).setHeader('Content-Type', 'text/html').send(`
        <html><body><h1>Error</h1><p>Database not connected</p></body></html>
      `);
    }

    const userId = req.user?.id || req.user?.userId;
    const { orderId } = req.params;

    if (!userId) {
      console.error('❌ No user ID found in request');
      return res.status(401).setHeader('Content-Type', 'text/html').send(`
        <html><body><h1>Error</h1><p>Authentication required</p></body></html>
      `);
    }

    if (!orderId) {
      console.error('❌ No order ID provided');
      return res.status(400).setHeader('Content-Type', 'text/html').send(`
        <html><body><h1>Error</h1><p>Order ID is required</p></body></html>
      `);
    }

    console.log('📄 Receipt request:', { orderId, userId, orderIdType: typeof orderId, userIdType: typeof userId });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.error('❌ Invalid orderId format:', orderId);
      return res.status(400).setHeader('Content-Type', 'text/html').send(`
        <html><body><h1>Error</h1><p>Invalid order ID format</p></body></html>
      `);
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid userId format:', userId);
      return res.status(400).setHeader('Content-Type', 'text/html').send(`
        <html><body><h1>Error</h1><p>Invalid user ID format</p></body></html>
      `);
    }

    // Verify order belongs to user - using ObjectId for comparison
    const order = await Order.findOne({ 
      _id: new mongoose.Types.ObjectId(orderId), 
      user: new mongoose.Types.ObjectId(userId) 
    });

    if (!order) {
      console.error('❌ Order not found:', { orderId, userId });
      // Try to find if order exists with different user
      const orderExists = await Order.findById(orderId);
      if (orderExists) {
        console.error('   Order exists but belongs to different user');
      } else {
        console.error('   Order does not exist at all');
      }
      return res.status(404).setHeader('Content-Type', 'text/html').send(`
        <html><body><h1>Error</h1><p>Order not found</p></body></html>
      `);
    }

    console.log('✅ Order found:', order.orderNumber);

    // Generate receipt HTML
    const receiptData = await generateReceipt(orderId);

    // Set headers for HTML response
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${receiptData.orderNumber}.html"`);
    
    res.send(receiptData.html);
  } catch (error) {
    console.error('❌ Error generating receipt:', error);
    console.error('   Error details:', {
      message: error.message,
      stack: error.stack,
      orderId: req.params?.orderId,
      userId: req.user?.id || req.user?.userId
    });
    res.status(500).setHeader('Content-Type', 'text/html').send(`
      <html><body><h1>Error</h1><p>Error generating receipt: ${error.message}</p></body></html>
    `);
  }
};

// Download receipt as HTML file
export const downloadReceipt = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    const userId = req.user?.id || req.user?.userId;
    const { orderId } = req.params;

    if (!userId) {
      console.error('❌ No user ID found in request');
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    if (!orderId) {
      console.error('❌ No order ID provided');
      return res.status(400).json({
        message: 'Order ID is required'
      });
    }

    console.log('📥 Download receipt request:', { orderId, userId, orderIdType: typeof orderId, userIdType: typeof userId });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.error('❌ Invalid orderId format:', orderId);
      return res.status(400).json({
        message: 'Invalid order ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid userId format:', userId);
      return res.status(400).json({
        message: 'Invalid user ID format'
      });
    }

    // Verify order belongs to user - using ObjectId for comparison
    const order = await Order.findOne({ 
      _id: new mongoose.Types.ObjectId(orderId), 
      user: new mongoose.Types.ObjectId(userId) 
    });

    if (!order) {
      console.error('❌ Order not found:', { orderId, userId });
      // Try to find if order exists with different user
      const orderExists = await Order.findById(orderId);
      if (orderExists) {
        console.error('   Order exists but belongs to different user');
      } else {
        console.error('   Order does not exist at all');
      }
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    console.log('✅ Order found for download:', order.orderNumber);

    // Generate receipt HTML first
    const receiptData = await generateReceipt(orderId);

    // Convert HTML to PDF
    console.log('📄 Converting HTML to PDF...');
    const pdfBuffer = await generateReceiptPDF(receiptData.html);

    // Set headers for PDF file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${receiptData.orderNumber}.pdf"`);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error downloading receipt:', error);
    console.error('   Error details:', {
      message: error.message,
      stack: error.stack,
      orderId: req.params?.orderId,
      userId: req.user?.id || req.user?.userId
    });
    res.status(500).json({
      message: 'Error downloading receipt',
      error: error.message
    });
  }
};







