import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { isManager } from '../middleware/managerMiddleware.js';
import {
  getAllProducts,
  updateStock,
  updatePrice,
  getStockStats,
  getAllOrders,
  updateOrderStatus,
  getCategories
} from '../controllers/managerController.js';

const router = express.Router();

// All manager routes require authentication and manager role or admin
router.use(authenticate);
router.use(isManager);

/**
 * @swagger
 * /api/manager/products:
 *   get:
 *     summary: Get all products (Manager)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 */
router.get('/products', getAllProducts);

/**
 * @swagger
 * /api/manager/products/{id}/stock:
 *   put:
 *     summary: Update product stock (Manager)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 */
router.put('/products/:id/stock', updateStock);

/**
 * @swagger
 * /api/manager/products/{id}/price:
 *   put:
 *     summary: Update product price (Manager)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 */
router.put('/products/:id/price', updatePrice);

/**
 * @swagger
 * /api/manager/statistics:
 *   get:
 *     summary: Get stock statistics (Manager)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics', getStockStats);

/**
 * @swagger
 * /api/manager/orders:
 *   get:
 *     summary: Get all orders (Manager)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 */
router.get('/orders', getAllOrders);

/**
 * @swagger
 * /api/manager/orders/{id}/status:
 *   put:
 *     summary: Update order status (Manager)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 */
router.put('/orders/:id/status', updateOrderStatus);

/**
 * @swagger
 * /api/manager/categories:
 *   get:
 *     summary: Get categories (Manager)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 */
router.get('/categories', getCategories);

export default router;

