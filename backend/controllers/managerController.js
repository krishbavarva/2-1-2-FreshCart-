import Product from '../models/Product.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

// Get all products with stock information (Manager can manage)
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, status, lowStock, page = 1, limit = 50 } = req.query;
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

    if (status && status !== 'all') {
      query.status = status;
    }

    if (lowStock === 'true') {
      query.stock = { $gt: 0, $lt: 30 };
    }

    const products = await Product.find(query)
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

// Update product price (Manager can manage prices)
export const updatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        message: 'Price must be a valid positive number'
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { price: price },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({
      message: 'Product price updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({
      message: 'Error updating price',
      error: error.message
    });
  }
};

// Update product stock (Manager can manage stock)
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'set', notes } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        message: 'Valid quantity is required'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    const oldStock = product.stock;
    product.updateStock(quantity, operation);
    
    if (operation === 'add' && quantity > 0) {
      product.restockHistory.push({
        quantity,
        date: new Date(),
        orderedBy: req.user.id || req.userId,
        notes: notes || 'Stock updated by manager'
      });
      product.lastRestocked = new Date();
    }

    await product.save();

    res.json({
      message: 'Stock updated successfully',
      product,
      stockChange: {
        old: oldStock,
        new: product.stock,
        change: product.stock - oldStock
      }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      message: 'Error updating stock',
      error: error.message
    });
  }
};

// Get stock statistics (Manager can view)
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
    
    let totalStockValue = 0;
    try {
      const stockValueResult = await Product.aggregate([
        {
          $project: {
            value: { $multiply: ['$stock', '$price'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$value' }
          }
        }
      ]);
      totalStockValue = stockValueResult[0]?.total || 0;
    } catch (aggError) {
      console.error('Error calculating stock value:', aggError);
      totalStockValue = 0;
    }

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
        inStock,
        totalStockValue
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

// Get all orders (Manager can manage)
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
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

// Update order status (Manager can update)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
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

// Get categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

