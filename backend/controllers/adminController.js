import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Get all products with stock information
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, status, lowStock, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
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

// Get single product
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Check if product with same productId exists
    const existingProduct = await Product.findOne({ productId: productData.productId });
    if (existingProduct) {
      return res.status(400).json({
        message: 'Product with this ID already exists'
      });
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Update product price (Admin/Manager)
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

// Update stock
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
    
    // Add to restock history if adding stock
    if (operation === 'add' && quantity > 0) {
      product.restockHistory.push({
        quantity,
        date: new Date(),
        orderedBy: req.user?.id || req.userId,
        notes: notes || 'Stock updated'
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

// Order new items (restock)
export const orderNewItems = async (req, res) => {
  try {
    const { productId, quantity, cost, supplier, notes } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        message: 'Product ID and valid quantity are required'
      });
    }

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Update supplier info if provided
    if (supplier) {
      product.supplier = {
        ...product.supplier,
        ...supplier
      };
    }

    // Add stock
    const oldStock = product.stock;
    product.updateStock(quantity, 'add');
    
    // Add to restock history
    product.restockHistory.push({
      quantity,
      date: new Date(),
      orderedBy: req.user.userId,
      cost: cost || 0,
      notes: notes || 'New order placed'
    });
    product.lastRestocked = new Date();

    await product.save();

    res.status(201).json({
      message: 'Order placed successfully',
      product,
      order: {
        quantity,
        cost: cost || 0,
        oldStock,
        newStock: product.stock
      }
    });
  } catch (error) {
    console.error('Error ordering items:', error);
    res.status(500).json({
      message: 'Error placing order',
      error: error.message
    });
  }
};

// Get stock statistics
export const getStockStats = async (req, res) => {
  try {
    const LOW_STOCK_THRESHOLD = 30; // Threshold for low stock
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established. Please check database connection.'
      });
    }
    
    // Check if Product model is available
    if (!Product) {
      return res.status(500).json({
        message: 'Product model not available',
        error: 'Database connection issue'
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
      // Continue with 0 value if aggregation fails
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
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Error fetching stock statistics',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all orders (customer orders)
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

// Get categories for filtering
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

// Create new user (Admin only)
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'customer', phone, address, zipCode, city, country } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: 'First name, last name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate role
    if (role && !['customer', 'rider', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be customer, rider, manager, or admin'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'customer',
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      zipCode: zipCode ? zipCode.trim() : '',
      city: city ? city.trim() : '',
      country: country ? country.trim() : ''
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        error: error.message,
        details: validationErrors
      });
    }

    res.status(500).json({
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};

    // Admin can see all users (customers, employees, managers)
    // Only filter by role if a specific role is requested
    if (role && role !== 'all') {
      query.role = role;
    }
    // If no role filter or 'all', show all users (don't filter by role)

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !['rider', 'manager'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be rider or manager'
      });
    }

    // Prevent admin from changing their own role
    if (id === req.user.userId) {
      return res.status(400).json({
        message: 'You cannot change your own role'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent changing admin role
    if (user.role === 'admin') {
      return res.status(403).json({
        message: 'Cannot change admin role'
      });
    }

    // Update role
    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent deleting admin
    if (user.role === 'admin') {
      return res.status(403).json({
        message: 'Cannot delete admin account'
      });
    }

    // Only allow deleting riders and managers
    if (!['rider', 'manager'].includes(user.role)) {
      return res.status(403).json({
        message: 'Can only delete riders and managers'
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      message: 'Error deleting user',
      error: error.message
    });
  }
};


