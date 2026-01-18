import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { isRider } from '../middleware/riderMiddleware.js';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getProducts,
  getStockStats
} from '../controllers/riderController.js';

const router = express.Router();

// Log route registration
console.log('✅ Rider routes module loaded');

// Health check endpoint (no auth required)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Rider routes are working',
    routes: [
      'GET /api/rider/orders (requires auth)',
      'GET /api/rider/orders/:id (requires auth)',
      'PUT /api/rider/orders/:id/status (requires auth)',
      'GET /api/rider/products (requires auth)',
      'GET /api/rider/statistics (requires auth)'
    ]
  });
});

// All rider routes require authentication and rider role or higher
router.use(authenticate);
router.use(isRider);

// Log middleware setup
console.log('✅ Rider middleware configured');

/**
 * @swagger
 * /api/rider/orders:
 *   get:
 *     summary: Get all orders (Rider)
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 */
router.get('/orders', (req, res, next) => {
  console.log('📦 Rider orders route hit:', req.method, req.originalUrl);
  next();
}, getAllOrders);

/**
 * @swagger
 * /api/rider/orders/{id}:
 *   get:
 *     summary: Get order by ID (Rider)
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 */
router.get('/orders/:id', getOrderById);

/**
 * @swagger
 * /api/rider/orders/{id}/status:
 *   put:
 *     summary: Update order status (Rider)
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 */
router.put('/orders/:id/status', updateOrderStatus);

/**
 * @swagger
 * /api/rider/products:
 *   get:
 *     summary: Get products (read-only) (Rider)
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 */
router.get('/products', getProducts);

/**
 * @swagger
 * /api/rider/statistics:
 *   get:
 *     summary: Get stock statistics (read-only) (Rider)
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics', (req, res, next) => {
  console.log('📊 Rider statistics route hit:', req.method, req.originalUrl);
  next();
}, getStockStats);

export default router;


