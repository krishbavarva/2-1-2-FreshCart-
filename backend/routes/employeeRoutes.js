import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { isEmployee } from '../middleware/employeeMiddleware.js';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getProducts,
  getStockStats
} from '../controllers/employeeController.js';

const router = express.Router();

// All employee routes require authentication and employee role or higher
router.use(authenticate);
router.use(isEmployee);

/**
 * @swagger
 * /api/employee/orders:
 *   get:
 *     summary: Get all orders (Employee)
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 */
router.get('/orders', getAllOrders);

/**
 * @swagger
 * /api/employee/orders/{id}:
 *   get:
 *     summary: Get order by ID (Employee)
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 */
router.get('/orders/:id', getOrderById);

/**
 * @swagger
 * /api/employee/orders/{id}/status:
 *   put:
 *     summary: Update order status (Employee)
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 */
router.put('/orders/:id/status', updateOrderStatus);

/**
 * @swagger
 * /api/employee/products:
 *   get:
 *     summary: Get products (read-only) (Employee)
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 */
router.get('/products', getProducts);

/**
 * @swagger
 * /api/employee/statistics:
 *   get:
 *     summary: Get stock statistics (read-only) (Employee)
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics', getStockStats);

export default router;




