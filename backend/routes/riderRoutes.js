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

// All rider routes require authentication and rider role or higher
router.use(authenticate);
router.use(isRider);

/**
 * @swagger
 * /api/rider/orders:
 *   get:
 *     summary: Get all orders (Rider)
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 */
router.get('/orders', getAllOrders);

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
router.get('/statistics', getStockStats);

export default router;


