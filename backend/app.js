import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.js';
import { connectDB, isDBConnected, getConnectionStatus, mongoose } from './config/database.js';
import { validateApiKey } from './middleware/apiKeyMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import managerRoutes from './routes/managerRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB connection - automatically connects and retries
console.log('\n📋 Environment Check:');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('   CLIENT_URL:', process.env.CLIENT_URL || 'http://localhost:5173 (default)');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? (process.env.MONGODB_URI.includes('@') ? '✅ Set (Atlas)' : '⚠️ Set (Local)') : '❌ Not set');

// Connect to MongoDB
connectDB();

// Check MongoDB connection status before handling requests
const checkMongoConnection = (req, res, next) => {
  if (!isDBConnected()) {
    return res.status(503).json({
      message: 'Database not connected. Please check MongoDB connection.',
      error: 'MongoDB connection is not established'
    });
  }
  next();
};

// Swagger documentation with API key support
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Grocery API Documentation',
  customCssUrl: null,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// Export OpenAPI JSON specification for Swagger Studio/SwaggerHub
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Health check
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

// MongoDB connection status check
app.get('/api/health/db', (req, res) => {
  const status = getConnectionStatus();
  res.json(status);
});

// API Key test endpoint
/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test API key authentication
 *     tags: [Test]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: API key is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: Unauthorized - API key missing
 *       403:
 *         description: Forbidden - Invalid API key
 */
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
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/manager', managerRoutes);

// Verify routes are registered
const registeredRoutes = [
  { path: '/api/auth', name: 'Authentication' },
  { path: '/api/products', name: 'Products' },
  { path: '/api/cart', name: 'Shopping Cart' },
  { path: '/api/orders', name: 'Order Management' },
  { path: '/api/admin', name: 'Admin Panel' },
  { path: '/api/customer', name: 'Customer Dashboard' },
  { path: '/api/employee', name: 'Employee Dashboard' },
  { path: '/api/manager', name: 'Manager Dashboard' }
];

console.log('\n✅ Routes registered:');
registeredRoutes.forEach(route => {
  console.log(`   - ${route.path} (${route.name})`);
});

// Verify route modules are loaded
try {
  if (!authRoutes || !productRoutes || !cartRoutes || !orderRoutes) {
    console.error('\n❌ ERROR: Some route modules failed to load!');
    console.error('   Please check route imports in app.js');
  } else {
    console.log('\n✅ All route modules loaded successfully');
  }
} catch (error) {
  console.error('\n❌ ERROR verifying routes:', error.message);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\n❌ UNHANDLED ERROR:', err);
  console.error('Error Name:', err.name);
  console.error('Error Message:', err.message);
  console.error('Error Code:', err.code);
  console.error('Stack Trace:', err.stack);
  console.error('Request Path:', req.path);
  console.error('Request Method:', req.method);
  console.error('');
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    errorName: err.name || 'Error',
    ...(err.code && { errorCode: err.code }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      path: req.path,
      method: req.method
    })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs\n`);
});

export default app;

