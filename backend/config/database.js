import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables - try multiple locations
dotenv.config(); // Root .env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') }); // Project root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') }); // Backend .env

// In Replit, environment variables come from Secrets (already in process.env)
// This dotenv.config() is mainly for local development

// Support both MONGO_URI and MONGODB_URI for compatibility
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grocery';

// Connection options with retry logic - optimized for Replit/cloud deployments
const connectionOptions = {
  serverSelectionTimeoutMS: 30000, // Increased for Replit (30 seconds)
  socketTimeoutMS: 60000, // Increased for Replit (60 seconds)
  connectTimeoutMS: 30000, // Increased for Replit (30 seconds)
  maxPoolSize: 10, // Maximum number of connections in the connection pool
  minPoolSize: 1, // Reduced for Replit (minimum connections)
  retryWrites: true, // Retry writes if they fail due to transient errors
  retryReads: true, // Retry reads if they fail due to transient errors
  // Additional options for cloud deployments
  heartbeatFrequencyMS: 10000, // Send heartbeat every 10 seconds
  // Note: serverSelectionRetryMS is not a valid option - removed to fix MongoParseError
};

// Track connection state
let isConnected = false;
let connectionAttempts = 0;
let isConnecting = false; // Prevent multiple simultaneous connection attempts
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Connect to MongoDB with automatic retry logic
 */
const connectDB = async (retryCount = 0) => {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    return; // Already attempting to connect, don't start another attempt
  }

  // Re-read MONGODB_URI from environment to ensure we have the latest value
  // In Replit, this comes from Secrets, not .env file
  // Support both MONGO_URI and MONGODB_URI for compatibility
  const currentMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grocery';
  
  // Validate URI is set
  if ((!process.env.MONGODB_URI && !process.env.MONGO_URI) || currentMongoUri === 'mongodb://localhost:27017/grocery') {
    console.error('\n❌ CRITICAL: MongoDB connection string is not set!');
    console.error('   For Replit: Go to Secrets (🔒 icon) and add:');
    console.error('   Key: MONGODB_URI (or MONGO_URI)');
    console.error('   Value: mongodb+srv://username:password@cluster.mongodb.net/grocery?retryWrites=true&w=majority');
    console.error('   Make sure there are NO spaces around the = sign!');
    console.error('   Example: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/grocery?retryWrites=true&w=majority');
    throw new Error('MongoDB connection string (MONGODB_URI or MONGO_URI) is required');
  }

  try {
    isConnecting = true; // Mark as connecting to prevent duplicate attempts
    connectionAttempts++;
    
    // Only log first attempt and every 10th attempt to reduce log spam
    if (connectionAttempts === 1 || connectionAttempts % 10 === 0) {
      console.log(`\n🔍 Attempting to connect to MongoDB... (Attempt ${connectionAttempts})`);
      
      // Log connection details (safely, without exposing password)
      if (currentMongoUri.includes('@')) {
        const uriParts = currentMongoUri.split('@');
        const credentials = uriParts[0].split('://')[1];
        const username = credentials.split(':')[0];
        console.log(`   Type: MongoDB Atlas`);
        console.log(`   Username: ${username}`);
        console.log(`   Host: ${uriParts[1]?.split('/')[0] || 'N/A'}`);
      } else {
        console.log(`   Type: Local MongoDB`);
      }
    }

    // Connect with increased timeout for Replit
    await mongoose.connect(currentMongoUri, connectionOptions);
    
    isConnected = true;
    isConnecting = false; // Reset connecting flag
    connectionAttempts = 0; // Reset on successful connection
    
    console.log('\n✅ Connected to MongoDB successfully!');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host || 'N/A'}`);
    console.log(`🔌 Port: ${mongoose.connection.port || 'N/A'}\n`);

  } catch (error) {
    isConnected = false;
    isConnecting = false; // Reset connecting flag
    
    // Only log errors on first attempt, last attempt, or every 10th attempt to reduce spam
    const shouldLog = connectionAttempts === 1 || retryCount === MAX_RETRY_ATTEMPTS - 1 || connectionAttempts % 10 === 0;
    
    if (shouldLog) {
      console.error(`\n❌ MongoDB connection FAILED (Attempt ${connectionAttempts}):`);
      console.error('   Error:', error.message);
      console.error('   Error Type:', error.name);
      
      // Show specific error messages only on first or last attempt
      if (connectionAttempts === 1 || retryCount === MAX_RETRY_ATTEMPTS - 1) {
        if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
          console.error('\n   🔴 AUTHENTICATION ERROR:');
          console.error('      - Check username and password in connection string');
          console.error('      - Verify database user exists in MongoDB Atlas');
        } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
          console.error('\n   🔴 NETWORK ERROR (MOST COMMON!):');
          console.error('      - MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0');
          console.error('      - Wait 2 minutes after adding IP');
          console.error('      - Check if MongoDB Atlas cluster is running (not paused)');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
          console.error('\n   🔴 DNS ERROR:');
          console.error('      - Check connection string hostname is correct');
        }
      }
    }
    
    // Retry logic
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      const delay = RETRY_DELAY * (retryCount + 1);
      if (shouldLog) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds... (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
      }
      setTimeout(() => {
        connectDB(retryCount + 1);
      }, delay);
    } else {
      console.error('\n💡💡💡 QUICK FIX (2 MINUTES):');
      console.error('   1. MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0 (WAIT 2 MINUTES!)');
      console.error('   2. Railway → Variables → Add: MONGODB_URI=mongodb+srv://krishbavarva:o8RVjnUOeMUUEd68@cluster0.atewaqb.mongodb.net/grocery?retryWrites=true&w=majority');
      console.error('   3. NO SPACES around = sign!');
      console.error('   4. Restart Railway service');
      console.error('\n⚠️  Server will continue, but database operations will fail!\n');
    }
  }
};

/**
 * Handle MongoDB connection events
 */
const setupConnectionHandlers = () => {
  // Connection successful
  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('✅ MongoDB connected');
  });

  // Connection error
  mongoose.connection.on('error', (error) => {
    isConnected = false;
    console.error('❌ MongoDB connection error:', error.message);
  });

  // Connection disconnected
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    isConnecting = false; // Reset connecting flag
    
    // Only log disconnect if not already attempting to reconnect (to reduce spam)
    if (!isConnecting) {
      const currentUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grocery';
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      
      // Automatically reconnect after a delay
      setTimeout(() => {
        if (!isConnected && !isConnecting) {
          // Use current URI from environment
          connectDB(0);
        }
      }, RETRY_DELAY);
    }
  });

  // Connection reconnected
  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('✅ MongoDB reconnected successfully');
  });

  // Handle process termination
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
};

/**
 * Check if MongoDB is connected
 */
const isDBConnected = () => {
  return mongoose.connection.readyState === 1 && isConnected;
};

/**
 * Get connection status
 */
const getConnectionStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    status: states[state] || 'unknown',
    readyState: state,
    connected: state === 1,
    database: mongoose.connection.name || 'N/A',
    host: mongoose.connection.host || 'N/A',
    port: mongoose.connection.port || 'N/A'
  };
};

/**
 * Close MongoDB connection
 */
const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
};

// Initialize connection handlers
setupConnectionHandlers();

export {
  connectDB,
  isDBConnected,
  getConnectionStatus,
  closeConnection,
  mongoose
};

export default connectDB;







