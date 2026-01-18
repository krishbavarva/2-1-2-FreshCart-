import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/payment/create-intent:
 *   post:
 *     summary: Create Stripe payment intent
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment intent created
 */
router.post('/create-intent', authenticate, createPaymentIntent);

/**
 * @swagger
 * /api/payment/confirm:
 *   post:
 *     summary: Confirm payment and create order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *               - shippingAddress
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *               shippingAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post('/confirm', authenticate, confirmPayment);

// Webhook endpoint (no auth middleware for Stripe webhooks)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;


