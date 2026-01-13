import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { isDBConnected } from '../config/database.js';

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

    // Calculate totals
    const subtotal = cart.totalPrice;
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    // Create order
    const order = await Order.create({
      user: userId,
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
      shippingAddress: shippingAddress || {},
      paymentMethod,
      paymentStatus: 'paid', // In production, integrate with payment gateway
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



