// ⚠️ CRITICAL: Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables - try multiple locations for Replit compatibility
// In Replit, Secrets are already in process.env, but we load .env for local dev
dotenv.config(); // Load from root .env (if exists)
dotenv.config({ path: path.join(__dirname, '.env') }); // Explicit path
dotenv.config({ path: path.join(__dirname, 'backend', '.env') }); // Backend .env

// Support both MONGO_URI and MONGODB_URI for compatibility
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

// CRITICAL: Log all environment variables for debugging (mask sensitive data)
console.log('\n🔍 Environment Variables Check:');
console.log('   MONGODB_URI:', mongoUri ? '✅ Found' : '❌ MISSING!');
console.log('   MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Not set');
if (mongoUri) {
  const varName = process.env.MONGODB_URI ? 'MONGODB_URI' : 'MONGO_URI';
  console.log('   Using variable:', varName);
  // Log connection string info (safely)
  if (mongoUri.includes('@')) {
    const parts = mongoUri.split('@');
    const user = parts[0].split('://')[1]?.split(':')[0] || 'N/A';
    const host = parts[1]?.split('/')[0] || 'N/A';
    console.log('   User:', user);
    console.log('   Host:', host);
  }
} else {
  console.error('\n❌❌❌ CRITICAL ERROR: MongoDB connection string is MISSING!');
  console.error('   In Replit: Go to 🔒 Secrets and add:');
  console.error('   Key: MONGODB_URI');
  console.error('   Value: mongodb+srv://krishbavarva:o8RVjnUOeMUUEd68@cluster0.atewaqb.mongodb.net/grocery?retryWrites=true&w=majority');
  console.error('   NO SPACES around = sign!\n');
}
console.log('   PORT:', process.env.PORT || 'Not set (using default 3000)');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'Not set');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import specs from './backend/config/swagger.js';
import { connectDB, isDBConnected, getConnectionStatus } from './backend/config/database.js';
import { validateApiKey } from './backend/middleware/apiKeyMiddleware.js';
import authRoutes from './backend/routes/authRoutes.js';
import productRoutes from './backend/routes/productRoutes.js';
import cartRoutes from './backend/routes/cartRoutes.js';
import orderRoutes from './backend/routes/orderRoutes.js';
import paymentRoutes from './backend/routes/paymentRoutes.js';
import adminRoutes from './backend/routes/adminRoutes.js';
import customerRoutes from './backend/routes/customerRoutes.js';
import employeeRoutes from './backend/routes/employeeRoutes.js';
import managerRoutes from './backend/routes/managerRoutes.js';


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow React to work properly
}));
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Allow all origins on Replit
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB connection - don't block server startup
// Support both MONGO_URI and MONGODB_URI for compatibility
const mongoConnectionString = process.env.MONGODB_URI || process.env.MONGO_URI;

console.log('\n📋 MongoDB Connection Check:');
console.log('   PORT:', PORT);
console.log('   Connection String:', mongoConnectionString ? '✅ Found' : '❌ MISSING - ADD TO REPLIT SECRETS!');
if (mongoConnectionString) {
  // Log connection string info (safely)
  const uri = mongoConnectionString;
  const varName = process.env.MONGODB_URI ? 'MONGODB_URI' : 'MONGO_URI';
  console.log('   Variable Used:', varName);
  if (uri.includes('@')) {
    const parts = uri.split('@');
    const user = parts[0].split('://')[1]?.split(':')[0] || 'N/A';
    const host = parts[1]?.split('/')[0] || 'N/A';
    const db = parts[1]?.split('/')[1]?.split('?')[0] || 'N/A';
    console.log('   MongoDB User:', user);
    console.log('   MongoDB Host:', host);
    console.log('   Database:', db);
    console.log('   Type:', uri.includes('mongodb+srv://') ? 'Atlas (Cloud)' : 'Local');
  }
} else {
  console.error('\n❌ CRITICAL: MongoDB connection string is NOT SET!');
  console.error('   To fix in Replit:');
  console.error('   1. Click the 🔒 Secrets icon (lock icon) in left sidebar');
  console.error('   2. Click "New secret"');
  console.error('   3. Key: MONGODB_URI (or MONGO_URI)');
  console.error('   4. Value: mongodb+srv://username:password@cluster.mongodb.net/grocery?retryWrites=true&w=majority');
  console.error('   5. IMPORTANT: NO SPACES around the = sign!');
  console.error('   6. Click "Add secret"');
  console.error('   7. Restart the server after adding\n');
}
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('   STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Not set');

// Connect to MongoDB asynchronously (don't block server startup)
// This allows health checks to pass even if MongoDB is still connecting
if (mongoConnectionString) {
  console.log('\n🔄 Starting MongoDB connection (non-blocking)...');
  connectDB().catch(err => {
    console.error('\n❌ MongoDB connection failed:', err.message);
    console.error('   Error type:', err.name);
    if (err.code) console.error('   Error code:', err.code);
    console.error('\n   🔧 Troubleshooting Steps:');
    console.error('   1. ✅ Verify MONGODB_URI (or MONGO_URI) is set in Replit Secrets (🔒 icon)');
    console.error('   2. ✅ MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0 (CRITICAL!)');
    console.error('   3. ✅ Wait 2 minutes after adding IP, then restart server');
    console.error('   4. ✅ Check connection string format (mongodb+srv://...)');
    console.error('   5. ✅ Verify MongoDB Atlas cluster is running (not paused)');
    console.error('   6. ✅ Check username/password are correct');
    console.error('   7. ✅ Make sure NO SPACES around = in Replit Secrets');
    console.error('\n   The server will continue, but database features will not work.\n');
  });
} else {
  console.error('\n⚠️  Skipping MongoDB connection - connection string not set');
  console.error('   Add MONGODB_URI (or MONGO_URI) to Replit Secrets to enable database features.\n');
}

// Check MongoDB connection status
const checkMongoConnection = (req, res, next) => {
  if (!isDBConnected()) {
    return res.status(503).json({
      message: 'Database not connected. Please check MongoDB connection.',
      error: 'MongoDB connection is not established'
    });
  }
  next();
};

// Swagger documentation
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Grocery API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Health check - must respond quickly for Replit
app.get('/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    mongodb: dbStatus.status,
    database: dbStatus.database,
    connected: dbStatus.connected,
    timestamp: new Date().toISOString()
  });
});


app.get('/api/health/db', (req, res) => {
  const status = getConnectionStatus();
  res.json(status);
});

// API Key test endpoint
app.get('/api/test', validateApiKey, (req, res) => {
  res.json({
    message: 'API key authentication successful!',
    timestamp: new Date().toISOString(),
    apiKey: req.apiKey ? 'Valid' : 'Not provided'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/manager', managerRoutes);

console.log('\n✅ API Routes registered:');
console.log('   - /api/auth');
console.log('   - /api/products');
console.log('   - /api/cart');
console.log('   - /api/orders');
console.log('   - /api/payment');
console.log('   - /api/admin');
console.log('   - /api/customer');
console.log('   - /api/employee');
console.log('   - /api/manager');

// Serve React static files (production build)
const frontendBuildPath = path.join(__dirname, 'frontend', 'dist');

// Check if React build exists
const reactBuildExists = fs.existsSync(frontendBuildPath) && fs.existsSync(path.join(frontendBuildPath, 'index.html'));

if (reactBuildExists) {
  app.use(express.static(frontendBuildPath));
  console.log('✅ React build found, serving static files');
} else {
  console.warn('⚠️ React build not found. Run: cd frontend && npm run build');
}

// Root endpoint - must respond quickly for Replit health checks
// This responds immediately without waiting for MongoDB or React build
app.get('/', (req, res) => {
  // Try to serve React app if built, otherwise return simple response
  if (reactBuildExists) {
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
      if (err) {
        // Fallback if file read fails
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head><title>FreshCart - Loading</title></head>
            <body>
              <h1>FreshCart Server is Running</h1>
              <p>Status: OK</p>
            </body>
          </html>
        `);
      }
    });
  } else {
    // Return simple response if React not built yet (for health checks)
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>FreshCart - Building</title></head>
        <body>
          <h1>FreshCart Server is Running</h1>
          <p>Status: OK</p>
          <p>Building React app... Please wait.</p>
          <p>Run: <code>cd frontend && npm run build</code></p>
        </body>
      </html>
    `);
  }
});

// Serve React app for all other non-API routes (SPA routing)
app.get('*', (req, res) => {
  // Don't serve React for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      error: 'Not Found',
      message: `API route ${req.method} ${req.path} not found.`
    });
  }
  
  // If React build exists, serve it
  if (reactBuildExists) {
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
      if (err) {
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head><title>FreshCart</title></head>
            <body>
              <h1>FreshCart</h1>
              <p>Server is running. React app is loading...</p>
            </body>
          </html>
        `);
      }
    });
  } else {
    // Return simple response if React not built
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>FreshCart - Building</title></head>
        <body>
          <h1>FreshCart Server is Running</h1>
          <p>Status: OK</p>
          <p>Building React app... Please wait.</p>
        </body>
      </html>
    `);
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `API route ${req.method} ${req.path} not found.`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\n❌ ERROR:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`\n✅ Ready to serve requests!\n`);
});

export default app;

