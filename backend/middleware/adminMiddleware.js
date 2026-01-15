import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Middleware to check if user is admin
 */
export const isAdmin = async (req, res, next) => {
  try {
    // Get user ID from request (set by authMiddleware)
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not connected',
        error: 'MongoDB connection is not established. Please check database connection.'
      });
    }

    // Fetch full user details to check role
    const userDoc = await User.findById(userId);
    
    if (!userDoc) {
      return res.status(404).json({
        message: 'User not found',
        error: `User with ID ${userId} does not exist in database`
      });
    }

    // Check if user is admin (only admin, not manager)
    if (userDoc.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Attach user details to request
    req.adminUser = userDoc;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      message: 'Error verifying admin access',
      error: error.message
    });
  }
};




