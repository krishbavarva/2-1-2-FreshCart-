import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Get all orders (Rider can view and manage orders)
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email phone address city zipCode country')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Update order status (Rider can update order status)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'ordered', 'processing', 'out_for_delivery', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('user', 'firstName lastName email phone address city zipCode country');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Get products (read-only for riders)
export const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const products = await Product.find(query)
      .select('name brand price image category stock status barcode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get stock statistics (read-only for riders)
export const getStockStats = async (req, res) => {
  try {
    const LOW_STOCK_THRESHOLD = 30;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not connected'
      });
    }

    const totalProducts = await Product.countDocuments() || 0;
    const outOfStock = await Product.countDocuments({ stock: 0 }) || 0;
    const lowStock = await Product.countDocuments({
      stock: { $gt: 0, $lt: LOW_STOCK_THRESHOLD }
    }) || 0;
    const inStock = await Product.countDocuments({ stock: { $gte: LOW_STOCK_THRESHOLD } }) || 0;

    const lowStockProducts = await Product.find({
      stock: { $gt: 0, $lt: LOW_STOCK_THRESHOLD }
    }).select('name stock minStockLevel').limit(20).lean() || [];

    const outOfStockProducts = await Product.find({
      stock: 0
    }).select('name stock').limit(20).lean() || [];

    res.json({
      statistics: {
        totalProducts,
        outOfStock,
        lowStock,
        inStock
      },
      lowStockProducts: lowStockProducts || [],
      outOfStockProducts: outOfStockProducts || []
    });
  } catch (error) {
    console.error('Error fetching stock stats:', error);
    res.status(500).json({
      message: 'Error fetching stock statistics',
      error: error.message
    });
  }
};

