import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getCustomerKPIs, getCustomerOrders } from '../controllers/customerController.js';

const router = express.Router();

// All customer routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/customer/kpis:
 *   get:
 *     summary: Get customer KPIs
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer KPIs including orders, spending, and statistics
 */
router.get('/kpis', getCustomerKPIs);

/**
 * @swagger
 * /api/customer/orders:
 *   get:
 *     summary: Get customer order history
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Customer orders
 */
router.get('/orders', getCustomerOrders);

export default router;

