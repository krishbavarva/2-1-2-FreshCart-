import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { isDBConnected } from '../config/database.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'User not authenticated',
        error: 'User ID not found in request'
      });
    }

    const userId = req.user.id;
    console.log('🔍 Getting cart for user:', userId, 'Type:', typeof userId);
    
    try {
      // Mongoose will automatically convert string to ObjectId
      let cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        // Create empty cart if it doesn't exist
        try {
          console.log('📦 Creating new cart for user:', userId);
          cart = new Cart({ user: userId, items: [] });
          await cart.save();
          console.log('✅ Cart created successfully:', cart._id);
        } catch (createError) {
          console.error('❌ Error creating cart:', createError);
          // If cart already exists (race condition), fetch it
          if (createError.code === 11000 || createError.name === 'MongoServerError') {
            console.log('🔄 Cart already exists, fetching...');
            cart = await Cart.findOne({ user: userId });
            if (!cart) {
              throw new Error('Cart creation failed and cart not found');
            }
          } else {
            throw createError;
          }
        }
      }
      
      // Populate user info (only if cart exists and user reference is valid)
      if (cart) {
        try {
          await cart.populate('user', 'firstName lastName email');
          console.log('✅ Cart retrieved successfully');
        } catch (populateError) {
          console.error('⚠️  Error populating user (non-fatal):', populateError.message);
          // Continue without populate if it fails
        }
      }

      if (!cart) {
        throw new Error('Cart is null after creation/fetch');
      }

      res.json({
        cart: cart,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      });
    } catch (innerError) {
      console.error('❌ Inner error in getCart:', innerError);
      throw innerError;
    }
  } catch (error) {
    console.error('❌ Error getting cart:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    
    // Send detailed error response
    const errorResponse = {
      message: 'Error fetching cart',
      error: error.message,
      errorName: error.name || 'UnknownError',
      ...(error.code && { errorCode: error.code }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        fullError: error.toString()
      })
    };
    
    console.error('Sending error response:', JSON.stringify(errorResponse, null, 2));
    
    res.status(500).json(errorResponse);
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'User not authenticated',
        error: 'User ID not found in request'
      });
    }

    const userId = req.user.id;
    console.log('🛒 Adding to cart for user:', userId);

    const { productId, name, brand, price, image, quantity = 1, category } = req.body;
    console.log('📦 Product data received:', { productId, name, price, quantity, body: req.body });

    if (!productId || !name || price === undefined) {
      return res.status(400).json({
        message: 'Product ID, name, and price are required',
        received: { productId, name, price }
      });
    }

    // Check product stock before adding to cart
    // Try finding by MongoDB _id first, then by productId
    let product = await Product.findById(productId);
    if (!product) {
      product = await Product.findOne({ productId: productId });
    }
    
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    if (product.stock === 0 || product.status === 'out_of_stock') {
      return res.status(400).json({
        message: 'Product is out of stock and cannot be added to cart'
      });
    }

    const requestedQuantity = parseInt(quantity) || 1;
    if (product.stock < requestedQuantity) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Validate price is a number
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        message: 'Price must be a valid positive number'
      });
    }

    // Mongoose will automatically convert string to ObjectId
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      try {
        console.log('📦 Creating new cart for user:', userId);
        cart = new Cart({ user: userId, items: [] });
        await cart.save();
        console.log('✅ Cart created:', cart._id);
      } catch (createError) {
        console.error('❌ Error creating cart:', createError);
        // If cart already exists (race condition), fetch it
        if (createError.code === 11000 || createError.name === 'MongoServerError') {
          console.log('🔄 Cart already exists, fetching...');
          cart = await Cart.findOne({ user: userId });
          if (!cart) {
            throw new Error('Cart creation failed and cart not found');
          }
        } else {
          throw createError;
        }
      }
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      console.log('➕ Updating existing item quantity');
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      cart.items[existingItemIndex].quantity = Math.max(1, newQuantity);
    } else {
      // Add new item
      console.log('➕ Adding new item to cart');
      const itemQuantity = Math.max(1, parseInt(quantity) || 1);
      cart.items.push({
        productId: String(productId).trim(),
        name: String(name).trim(),
        brand: (brand || '').trim(),
        price: parsedPrice,
        image: (image || '').trim(),
        quantity: itemQuantity,
        category: (category || '').trim()
      });
    }

    // Validate before saving
    try {
      await cart.validate();
      await cart.save();
      console.log('💾 Cart saved successfully');
    } catch (validationError) {
      console.error('❌ Cart validation error:', validationError);
      throw validationError;
    }
    
    // Populate user info (handle errors gracefully)
    try {
      await cart.populate('user', 'firstName lastName email');
    } catch (populateError) {
      console.error('⚠️  Error populating user (non-fatal):', populateError.message);
      // Continue without populate if it fails
    }

    res.json({
      message: 'Item added to cart',
      cart: cart,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    
    // Send detailed error response
    const errorResponse = {
      message: 'Error adding item to cart',
      error: error.message,
      errorName: error.name || 'UnknownError',
      ...(error.code && { errorCode: error.code }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        fullError: error.toString()
      })
    };
    
    console.error('Sending error response:', JSON.stringify(errorResponse, null, 2));
    
    res.status(500).json(errorResponse);
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    console.log('🛒 [UPDATE CART ITEM] Request received:', {
      method: req.method,
      path: req.path,
      itemId: req.params.itemId,
      quantity: req.body.quantity
    });

    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'User not authenticated',
        error: 'User ID not found in request'
      });
    }

    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    console.log('📦 Update cart item params:', { userId, itemId, quantity });

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be at least 1'
      });
    }

    if (!itemId) {
      return res.status(400).json({
        message: 'Item ID is required'
      });
    }

    // Mongoose will automatically convert string to ObjectId
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      console.log('❌ Cart not found for user:', userId);
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      console.log('❌ Item not found in cart:', itemId);
      console.log('Available items:', cart.items.map(i => i._id.toString()));
      return res.status(404).json({
        message: 'Item not found in cart'
      });
    }

    // Check product stock before updating quantity
    // item.productId can be either MongoDB _id or productId field (barcode)
    // Try multiple lookup strategies
    let product = null;
    const itemProductId = item.productId;
    
    console.log('🔍 Looking up product for cart item:', {
      itemProductId,
      itemProductIdType: typeof itemProductId,
      itemId: item._id.toString()
    });
    
    // Strategy 1: Try as MongoDB _id (most common case)
    try {
      if (mongoose.Types.ObjectId.isValid(itemProductId)) {
        product = await Product.findById(itemProductId);
        if (product) {
          console.log('✅ Found product by MongoDB _id:', product._id.toString());
        }
      }
    } catch (idError) {
      console.log('⚠️  MongoDB _id lookup failed:', idError.message);
    }
    
    // Strategy 2: Try as productId field (barcode from Open Food Facts)
    if (!product) {
      product = await Product.findOne({ productId: itemProductId });
      if (product) {
        console.log('✅ Found product by productId field:', product.productId);
      }
    }
    
    // Strategy 3: Try by name (last resort, but shouldn't be needed)
    if (!product && item.name) {
      product = await Product.findOne({ name: { $regex: item.name, $options: 'i' } });
      if (product) {
        console.log('✅ Found product by name:', product.name);
      }
    }
    
    if (!product) {
      console.log('❌ Product not found with any strategy:', {
        itemProductId,
        itemName: item.name,
        availableProductsCount: await Product.countDocuments({})
      });
      return res.status(404).json({
        message: `Product not found: ${item.name || itemProductId}. The product may have been removed from inventory.`,
        itemProductId
      });
    }

    if (product.stock === 0 || product.status === 'out_of_stock') {
      return res.status(400).json({
        message: 'Product is out of stock'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock`
      });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('user', 'firstName lastName email');

    res.json({
      message: 'Cart item updated',
      cart: cart,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      message: 'Error updating cart item',
      error: error.message
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'User not authenticated',
        error: 'User ID not found in request'
      });
    }

    const userId = req.user.id;
    const { itemId } = req.params;

    // Mongoose will automatically convert string to ObjectId
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate('user', 'firstName lastName email');

    res.json({
      message: 'Item removed from cart',
      cart: cart,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      message: 'Error removing item from cart',
      error: error.message
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'User not authenticated',
        error: 'User ID not found in request'
      });
    }

    const userId = req.user.id;

    // Mongoose will automatically convert string to ObjectId
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();
    await cart.populate('user', 'firstName lastName email');

    res.json({
      message: 'Cart cleared',
      cart: cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      message: 'Error clearing cart',
      error: error.message
    });
  }
};

