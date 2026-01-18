import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery';

// Connection options with retry logic
const connectionOptions = {
  serverSelectionTimeoutMS: 10000, // How long to try selecting a server
  socketTimeoutMS: 45000, // How long to wait for a socket to be established
  connectTimeoutMS: 10000, // How long to wait for initial connection
  maxPoolSize: 10, // Maximum number of connections in the connection pool
  minPoolSize: 5, // Minimum number of connections in the connection pool
  retryWrites: true, // Retry writes if they fail due to transient errors
  retryReads: true, // Retry reads if they fail due to transient errors
};

// Track connection state
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Connect to MongoDB with automatic retry logic
 */
const connectDB = async (retryCount = 0) => {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    isConnected = true;
    return;
  }

  // Re-read MONGODB_URI from environment to ensure we have the latest value
  const currentMongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery';

  try {
    connectionAttempts++;
    console.log(`\n🔍 Attempting to connect to MongoDB... (Attempt ${connectionAttempts})`);
    console.log(`   URI: ${currentMongoUri.includes('@') ? currentMongoUri.split('@')[0] + '@...' : currentMongoUri}`);
    
    if (currentMongoUri.includes('@')) {
      console.log('   Type: MongoDB Atlas');
    } else {
      console.log('   Type: Local MongoDB');
    }

    await mongoose.connect(currentMongoUri, connectionOptions);
    
    isConnected = true;
    connectionAttempts = 0; // Reset on successful connection
    
    console.log('✅ Connected to MongoDB successfully!');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`🌐 Host: ${mongoose.connection.host || 'N/A'}`);
    console.log(`🔌 Port: ${mongoose.connection.port || 'N/A'}\n`);

  } catch (error) {
    isConnected = false;
    console.error(`\n❌ MongoDB connection error (Attempt ${connectionAttempts}):`, error.message);
    
    // Retry logic
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      const delay = RETRY_DELAY * (retryCount + 1); // Exponential backoff
      console.log(`⏳ Retrying in ${delay / 1000} seconds... (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
      
      setTimeout(() => {
        connectDB(retryCount + 1);
      }, delay);
    } else {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   1. Check if MONGODB_URI is set correctly in .env file');
      console.error('   2. For MongoDB Atlas: Check network access (IP whitelist)');
      console.error('   3. For Local MongoDB: Make sure MongoDB service is running');
      console.error('   4. Verify username and password are correct');
      console.error('   5. Check your internet connection');
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
    const currentUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery';
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    console.log(`   Target: ${currentUri.includes('@') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
    
    // Automatically reconnect after a delay
    setTimeout(() => {
      if (!isConnected) {
        console.log('🔄 Attempting to reconnect to MongoDB...');
        // Use current URI from environment
        connectDB(0);
      }
    }, RETRY_DELAY);
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







