import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateStock,
  updatePrice,
  orderNewItems,
  getStockStats,
  getAllOrders,
  getCategories,
  createUser,
  getAllUsers
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products with stock information
 */
router.get('/products', getAllProducts);

/**
 * @swagger
 * /api/admin/products/categories:
 *   get:
 *     summary: Get product categories (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/products/categories', getCategories);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   get:
 *     summary: Get product by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/products/:id', getProduct);

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create new product (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/products', createProduct);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated
 */
router.put('/products/:id', updateProduct);

/**
 * @swagger
 * /api/admin/products/{id}/stock:
 *   put:
 *     summary: Update product stock (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               operation:
 *                 type: string
 *                 enum: [set, add, subtract]
 *     responses:
 *       200:
 *         description: Stock updated
 */
router.put('/products/:id/stock', updateStock);

/**
 * @swagger
 * /api/admin/products/{id}/price:
 *   put:
 *     summary: Update product price (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Price updated
 */
router.put('/products/:id/price', updatePrice);

/**
 * @swagger
 * /api/admin/orders/new:
 *   post:
 *     summary: Order new items (restock) (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Order placed
 */
router.post('/orders/new', orderNewItems);

/**
 * @swagger
 * /api/admin/statistics:
 *   get:
 *     summary: Get stock statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock statistics
 */
router.get('/statistics', getStockStats);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all customer orders (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/orders', getAllOrders);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/users', createUser);

export default router;


