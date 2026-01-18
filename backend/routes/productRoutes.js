import express from 'express';
import { getProducts, getProductById, searchProducts, getCategories, toggleLike, getProductByBarcode, getLikedProducts, generateProteinPlan } from '../controllers/productController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get products from Open Food Facts API
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for products
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', authenticate, getProducts);

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get available product categories
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available categories
 */
router.get('/categories', authenticate, getCategories);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', authenticate, searchProducts);

// Protein plan route - MUST be registered BEFORE any parameterized routes
/**
 * @swagger
 * /api/products/protein-plan:
 *   post:
 *     summary: Generate personalized protein plan
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - age
 *               - weight
 *               - height
 *             properties:
 *               age:
 *                 type: number
 *                 description: User's age in years
 *                 example: 25
 *               weight:
 *                 type: number
 *                 description: User's weight in kg
 *                 example: 70
 *               height:
 *                 type: number
 *                 description: User's height in cm
 *                 example: 175
 *               activityLevel:
 *                 type: string
 *                 enum: [sedentary, light, moderate, active, very_active]
 *                 description: User's activity level
 *                 default: moderate
 *                 example: moderate
 *               goal:
 *                 type: string
 *                 enum: [maintenance, muscle_gain, weight_loss]
 *                 description: User's fitness goal
 *                 default: maintenance
 *                 example: maintenance
 *     responses:
 *       200:
 *         description: Protein plan generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailyProteinNeed:
 *                   type: number
 *                   description: Total daily protein requirement in grams
 *                 breakfast:
 *                   type: object
 *                   properties:
 *                     proteinTarget:
 *                       type: number
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                 lunch:
 *                   type: object
 *                   properties:
 *                     proteinTarget:
 *                       type: number
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                 dinner:
 *                   type: object
 *                   properties:
 *                     proteinTarget:
 *                       type: number
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.post('/protein-plan', authenticate, generateProteinPlan);

// Specific routes (must come before parameterized routes)
router.get('/barcode/:barcode', authenticate, getProductByBarcode);
router.get('/liked', authenticate, getLikedProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID (barcode)
 *     responses:
 *       200:
 *         description: Product details
 */

// Parameterized routes (must come after all specific routes)
router.post('/:id/like', authenticate, toggleLike);
router.get('/:id', authenticate, getProductById);

export default router;

