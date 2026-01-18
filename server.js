// ⚠️ CRITICAL: Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// MongoDB connection
console.log('\n📋 Environment Check:');
console.log('   PORT:', PORT);
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

connectDB();

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

// Root endpoint - must respond quickly for Replit health checks
// This responds immediately without waiting for MongoDB
app.get('/', (req, res) => {
  // Try to serve React app, but if not built, return simple response
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      // If React app not built, return simple HTML response
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>FreshCart - Loading</title></head>
          <body>
            <h1>FreshCart Server is Running</h1>
            <p>Status: OK</p>
            <p>Please wait while the React app is being built...</p>
            <p>If you see this message, run: <code>cd frontend && npm run build</code></p>
          </body>
        </html>
      `);
    }
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
const fs = require('fs');
const reactBuildExists = fs.existsSync(frontendBuildPath) && fs.existsSync(path.join(frontendBuildPath, 'index.html'));

if (reactBuildExists) {
  app.use(express.static(frontendBuildPath));
  console.log('✅ React build found, serving static files');
} else {
  console.warn('⚠️ React build not found. Run: cd frontend && npm run build');
}

// Serve React app for all non-API routes (SPA routing)
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
        console.error('Error serving React app:', err);
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
          <p>Run: <code>cd frontend && npm run build</code></p>
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

