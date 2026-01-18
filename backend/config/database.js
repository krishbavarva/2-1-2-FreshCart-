import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery';

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
  serverSelectionRetryMS: 5000, // Retry server selection every 5 seconds
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
      console.log(`   URI: ${currentMongoUri}`);
    }
    
    // Validate URI format
    if (!currentMongoUri || currentMongoUri === 'mongodb://localhost:27017/grocery') {
      console.warn('⚠️  Using default MongoDB URI. Make sure MONGODB_URI is set in environment variables!');
    }

    // Connect with increased timeout for Replit
    console.log('   Connecting... (this may take up to 30 seconds)');
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
      console.error('   1. Check if MONGODB_URI is set correctly in Replit Secrets');
      console.error('   2. For MongoDB Atlas:');
      console.error('      - Go to Network Access → Add IP Address');
      console.error('      - Add: 0.0.0.0/0 (allow all IPs) for Replit');
      console.error('      - Or add specific Replit IP ranges');
      console.error('   3. Verify username and password are correct in connection string');
      console.error('   4. Check MongoDB Atlas cluster is running (not paused)');
      console.error('   5. For Replit: Make sure MONGODB_URI secret is set correctly');
      console.error('   6. Test connection string format: mongodb+srv://user:pass@cluster.mongodb.net/dbname');
      console.error('\n⚠️  Server will continue, but database operations will fail!');
      console.error('   The app will work, but you need to fix MongoDB connection for full functionality.\n');
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







