import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register a new user
export const register = async (req, res) => {
  try {
    console.log('📝 Registration attempt:', { email: req.body.email });
    const { firstName, lastName, email, password, phone, address, zipCode, city, country } = req.body;

    // Check MongoDB connection first
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({
        message: 'Database connection error. Please check MongoDB connection.',
        error: 'MongoDB is not connected',
        details: 'Make sure MongoDB is running and MONGODB_URI is correct in .env file'
      });
    }

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    let existingUser;
    try {
      existingUser = await User.findOne({ email });
    } catch (dbError) {
      console.error('❌ Database error checking existing user:', dbError);
      return res.status(503).json({
        message: 'Database connection error',
        error: dbError.message,
        details: 'Unable to check if user exists. Please check MongoDB connection.'
      });
    }
    
    if (existingUser) {
      console.log('⚠️ User already exists:', email);
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }
    console.log('✅ User does not exist, proceeding with registration...');

    // Create new user
    // IMPORTANT: Regular registration always defaults to 'customer' role
    // Role cannot be set via regular registration endpoint
    console.log('📝 Creating new user...');
    let user;
    try {
      user = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: 'customer', // Always set to 'customer' for regular registration
        phone: phone ? phone.trim() : '',
        address: address ? address.trim() : '',
        zipCode: zipCode ? zipCode.trim() : '',
        city: city ? city.trim() : '',
        country: country ? country.trim() : ''
      });

      console.log('💾 Saving user to database...');
      await user.save();
      console.log('✅ User saved successfully:', user._id);
      console.log('🔍 Password hash exists after save:', !!user.password);
    } catch (saveError) {
      console.error('❌ Error saving user:', saveError);
      
      // Handle duplicate key error (email unique constraint)
      if (saveError.code === 11000 || saveError.name === 'MongoServerError') {
        return res.status(400).json({
          message: 'User with this email already exists',
          error: 'Duplicate email'
        });
      }
      
      // Handle validation errors
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors).map(err => err.message);
        return res.status(400).json({
          message: 'Validation error',
          error: saveError.message,
          details: validationErrors
        });
      }
      
      // Re-throw to be caught by outer catch
      throw saveError;
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('\n=== REGISTRATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    console.error('========================\n');
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoServerError' || 
        error.message.includes('Mongo') || 
        error.message.includes('connection') ||
        error.message.includes('timeout')) {
      return res.status(503).json({
        message: 'Database connection error. Please check MongoDB connection.',
        error: error.message,
        details: 'Make sure MongoDB is running and MONGODB_URI is correct in .env file'
      });
    }
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      const validationErrors = error.errors ? Object.values(error.errors).map(err => err.message) : [error.message];
      return res.status(400).json({
        message: 'Validation error',
        error: error.message,
        details: validationErrors
      });
    }
    
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'User with this email already exists',
        error: 'Duplicate email'
      });
    }
    
    // Generic server error
    res.status(500).json({
      message: 'Server error during registration',
      error: error.message || 'An unexpected error occurred',
      errorName: error.name || 'Error',
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        fullError: error.toString()
      })
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user - check for both password and passwordHash (backward compatibility)
    console.log('🔍 Finding user...');
    let user = await User.findOne({ email }).select('+password');
    
    // If password is not available, check for passwordHash (old schema)
    if (!user || !user.password) {
      console.log('⚠️ Password not found, checking for passwordHash (old schema)...');
      // Use lean() to get raw MongoDB document with all fields
      const rawUser = await User.findOne({ email }).lean();
      
      if (!rawUser) {
        console.log('❌ User not found:', email);
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }
      
      if (rawUser.passwordHash && !rawUser.password) {
        console.log('⚠️ Found passwordHash field (old schema), migrating to password...');
        // Migrate passwordHash to password field
        await User.updateOne(
          { _id: rawUser._id },
          { $set: { password: rawUser.passwordHash }, $unset: { passwordHash: "" } }
        );
        // Re-fetch user with password
        user = await User.findOne({ email }).select('+password');
        console.log('✅ Migrated passwordHash to password');
      } else {
        // No password or passwordHash found
        user = await User.findOne({ email });
      }
    }
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    
    console.log('✅ User found:', user._id);
    
    // For backward compatibility, check if passwordHash exists in raw document
    if (!user.password) {
      const rawUser = await User.findOne({ email }).lean();
      if (rawUser && rawUser.passwordHash) {
        // Temporarily set passwordHash for comparison
        user.passwordHash = rawUser.passwordHash;
        console.log('⚠️ Using passwordHash for comparison (will migrate after successful login)');
      }
    }
    
    const hasPassword = !!(user.password || user.passwordHash);
    console.log('🔍 Password field exists:', !!user.password);
    console.log('🔍 PasswordHash field exists:', !!user.passwordHash);
    
    if (!hasPassword) {
      console.error('❌ Password field is missing for user:', user._id);
      return res.status(500).json({
        message: 'User data error. Password field is missing. Please delete this user and re-register.',
        error: 'Password field not available',
        solution: 'Delete the user from MongoDB and register again'
      });
    }

    // Check password
    console.log('🔒 Verifying password...');
    console.log('🔍 Candidate password length:', password ? password.length : 'undefined');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    console.log('✅ Password verified');

    // Generate token
    console.log('🎫 Generating token...');
    const token = generateToken(user._id);
    console.log('✅ Token generated');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    console.error('==================');
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoServerError' || error.message.includes('Mongo') || error.message.includes('connection')) {
      return res.status(503).json({
        message: 'Database connection error. Please check MongoDB connection.',
        error: error.message,
        details: 'Make sure MongoDB Atlas is connected and MONGODB_URI is correct in .env file'
      });
    }
    
    res.status(500).json({
      message: 'Server error during login',
      error: error.message,
      errorName: error.name,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        fullError: error.toString()
      })
    });
  }
};

// Get current user (protected route)
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

