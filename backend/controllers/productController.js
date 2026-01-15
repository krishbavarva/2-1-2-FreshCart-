import axios from 'axios';
import Product from '../models/Product.js';

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org';

// Helper function to extract primary category from categories string
const extractPrimaryCategory = (categoriesString) => {
  if (!categoriesString) return 'Uncategorized';
  
  // Categories are usually separated by commas, take the first one
  const categories = categoriesString.split(',').map(c => c.trim());
  if (categories.length > 0) {
    // Remove language prefixes like "en:" or "fr:"
    return categories[0].replace(/^[a-z]{2}:/i, '').trim();
  }
  return 'Uncategorized';
};

// Get products - check database first, then fallback to API
export const getProducts = async (req, res) => {
  try {
    const { search, page = 1, category, filter, proteinMin, nutriscoreGrade, bestSeller } = req.query;
    const pageSize = 24;
    const skip = (parseInt(page) - 1) * pageSize;

    // Build query
    let dbQuery = {
      stock: { $gt: 0 }, // Only show products with stock > 0 for customers
      status: 'active'
    };
    
    if (search) {
      dbQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      dbQuery.category = { $regex: category, $options: 'i' };
    }

    // Filter by protein (minimum protein content)
    if (proteinMin) {
      dbQuery.protein = { $gte: parseFloat(proteinMin) };
    }

    // Filter by Nutri-Score grade
    if (nutriscoreGrade && nutriscoreGrade !== 'all') {
      dbQuery.nutriscoreGrade = nutriscoreGrade.toUpperCase();
    }

    // Filter by best seller
    if (bestSeller === 'true') {
      dbQuery.isBestSeller = true;
    }

    // Additional filter type
    if (filter === 'best-seller') {
      dbQuery.isBestSeller = true;
    } else if (filter === 'high-protein') {
      dbQuery.protein = { $gte: 10 }; // Products with at least 10g protein per 100g
    } else if (filter === 'nutritious') {
      dbQuery.nutriscoreGrade = { $in: ['A', 'B'] }; // Only A and B grades
    }

    const dbProducts = await Product.find(dbQuery)
      .sort({ 
        isBestSeller: -1, // Best sellers first
        salesCount: -1, // Then by sales count
        createdAt: -1 
      })
      .skip(skip)
      .limit(pageSize);

    const total = await Product.countDocuments(dbQuery);

    // Format database products
    const formattedProducts = dbProducts.map(product => ({
      id: product._id.toString(),
      productId: product.productId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      category: product.category,
      barcode: product.barcode,
      stock: product.stock,
      unit: product.unit,
      status: product.status,
      description: product.description,
      nutriscoreGrade: product.nutriscoreGrade,
      nutriscoreScore: product.nutriscoreScore,
      protein: product.protein,
      nutritionalValue: product.nutritionalValue,
      likesCount: product.likesCount,
      isBestSeller: product.isBestSeller,
      salesCount: product.salesCount
    }));

    res.json({
      products: formattedProducts,
      pagination: {
        page: parseInt(page),
        pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query) {
      return res.json({ products: [] });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ],
      stock: { $gt: 0 },
      status: 'active'
    })
    .limit(50)
    .sort({ isBestSeller: -1, salesCount: -1 });

    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      productId: product.productId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      category: product.category,
      barcode: product.barcode,
      stock: product.stock,
      unit: product.unit,
      status: product.status,
      nutriscoreGrade: product.nutriscoreGrade,
      protein: product.protein,
      isBestSeller: product.isBestSeller
    }));

    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      message: 'Error searching products',
      error: error.message
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Get categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories: categories.filter(c => c && c !== 'Uncategorized').sort() });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Like/Unlike product
export const toggleLike = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    const isLiked = product.likes.includes(userId);
    
    if (isLiked) {
      // Unlike
      product.likes = product.likes.filter(likeId => likeId.toString() !== userId);
      product.likesCount = Math.max(0, product.likesCount - 1);
    } else {
      // Like
      product.likes.push(userId);
      product.likesCount = product.likesCount + 1;
    }

    await product.save();

    res.json({
      message: isLiked ? 'Product unliked' : 'Product liked',
      isLiked: !isLiked,
      likesCount: product.likesCount
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      message: 'Error toggling like',
      error: error.message
    });
  }
};

// Get product by barcode
export const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const product = await Product.findOne({ barcode: barcode });
    
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({ product });
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    res.status(500).json({
      message: 'Error fetching product',
      error: error.message
    });
  }
};
