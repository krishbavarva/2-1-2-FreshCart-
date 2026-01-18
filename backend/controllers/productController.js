import axios from 'axios';
import Product from '../models/Product.js';
import User from '../models/User.js';

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
    const { search, page = 1, category, filter, proteinFilter, popularityFilter, proteinMin, nutriscoreGrade, bestSeller, sort } = req.query;
    const pageSize = 24;
    const skip = (parseInt(page) - 1) * pageSize;

    // Build query - Show all products (remove status filter to show all products)
    let dbQuery = {};
    let searchOrConditions = null;
    let proteinOrConditions = null;
    
    // Build search conditions
    if (search) {
      searchOrConditions = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      dbQuery.category = { $regex: category, $options: 'i' };
    }

    // Filter by protein level
    if (proteinFilter) {
      if (proteinFilter === 'high') {
        dbQuery.protein = { $gte: 20 }; // High protein: ≥20g per 100g
      } else if (proteinFilter === 'medium') {
        dbQuery.protein = { $gte: 10, $lt: 20 }; // Medium protein: 10-19g per 100g
      } else if (proteinFilter === 'low') {
        proteinOrConditions = [
          { protein: { $lt: 10 } },
          { protein: null }
        ];
      }
    }

    // Handle multiple $or conditions (search + protein filter)
    if (searchOrConditions || proteinOrConditions) {
      const andConditions = [];
      if (searchOrConditions) {
        andConditions.push({ $or: searchOrConditions });
      }
      if (proteinOrConditions) {
        andConditions.push({ $or: proteinOrConditions });
      }
      if (andConditions.length > 0) {
        if (andConditions.length === 1) {
          Object.assign(dbQuery, andConditions[0]);
        } else {
          dbQuery.$and = andConditions;
        }
      }
    }

    // Filter by protein (minimum protein content) - backward compatibility
    // Only apply if proteinFilter is not set
    if (proteinMin && !proteinFilter) {
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

    // Additional filter type - backward compatibility
    if (filter === 'best-seller') {
      dbQuery.isBestSeller = true;
    } else if (filter === 'high-protein') {
      dbQuery.protein = { $gte: 10 }; // Products with at least 10g protein per 100g
    } else if (filter === 'nutritious') {
      dbQuery.nutriscoreGrade = { $in: ['A', 'B'] }; // Only A and B grades
    }

    // Check total products in database first
    const totalInDB = await Product.countDocuments({});
    console.log(`📊 Total products in database: ${totalInDB}`);
    
    // If database is empty, return early with helpful message
    if (totalInDB === 0) {
      console.log('⚠️ WARNING: Database is empty! Run: npm run sync-products');
      return res.json({
        products: [],
        pagination: {
          page: parseInt(page),
          pageSize,
          total: 0,
          pages: 0
        },
        message: 'No products in database. Please run sync script: npm run sync-products'
      });
    }

    // Determine sort order based on popularity filter or sort parameter
    let sortOrder = { 
      isBestSeller: -1, // Best sellers first
      salesCount: -1, // Then by sales count
      createdAt: -1 
    };

    if (sort || popularityFilter) {
      const sortType = sort || popularityFilter;
      switch (sortType) {
        case 'most-liked':
          sortOrder = { likesCount: -1, isBestSeller: -1, createdAt: -1 };
          break;
        case 'most-sold':
          sortOrder = { salesCount: -1, isBestSeller: -1, likesCount: -1, createdAt: -1 };
          break;
        case 'best-seller':
          sortOrder = { isBestSeller: -1, salesCount: -1, likesCount: -1, createdAt: -1 };
          break;
        case 'trending':
          // Trending = recent sales + likes (products with sales in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          sortOrder = { salesCount: -1, likesCount: -1, updatedAt: -1, createdAt: -1 };
          break;
        case 'high-protein':
          sortOrder = { protein: -1, isBestSeller: -1, salesCount: -1 };
          break;
        case 'price-low':
          sortOrder = { price: 1, createdAt: -1 };
          break;
        case 'price-high':
          sortOrder = { price: -1, createdAt: -1 };
          break;
        default:
          sortOrder = { isBestSeller: -1, salesCount: -1, createdAt: -1 };
      }
    }

    // First, try with the query
    let dbProducts = await Product.find(dbQuery)
      .sort(sortOrder)
      .skip(skip)
      .limit(pageSize);

    console.log(`📦 Query returned ${dbProducts.length} products with filters`);

    // If no products found with query, try without any filters
    if (dbProducts.length === 0 && Object.keys(dbQuery).length > 0) {
      console.log('⚠️ No products found with query, trying without filters...');
      dbProducts = await Product.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);
      console.log(`📦 Without filters returned ${dbProducts.length} products`);
    }

    // Get total count
    const total = await Product.countDocuments(dbQuery);
    
    console.log(`✅ Final: ${dbProducts.length} products to return (query total: ${total}, DB total: ${totalInDB})`);

    // Get user ID if authenticated
    const userId = req.user?.id || null;

    // Format database products
    const formattedProducts = dbProducts.map(product => {
      const productObj = {
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
        likesCount: product.likesCount || 0,
        isBestSeller: product.isBestSeller,
        salesCount: product.salesCount
      };

      // Add isLiked status if user is authenticated
      if (userId) {
        productObj.isLiked = product.likes && product.likes.some(
          likeId => likeId.toString() === userId
        );
      } else {
        productObj.isLiked = false;
      }

      return productObj;
    });

    // Always return products array, even if empty
    const response = {
      products: formattedProducts || [],
      pagination: {
        page: parseInt(page),
        pageSize,
        total: total || 0,
        pages: Math.ceil((total || 0) / pageSize) || 0
      }
    };
    
    console.log(`✅ Sending response: ${formattedProducts.length} products, total in DB: ${totalInDB}`);
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      message: 'Error fetching products',
      error: error.message,
      products: [] // Always return empty array on error
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
      status: 'active'
    })
    .limit(50)
    .sort({ isBestSeller: -1, salesCount: -1 });

    // Get user ID if authenticated
    const userId = req.user?.id || null;

    const formattedProducts = products.map(product => {
      const productObj = {
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
        isBestSeller: product.isBestSeller,
        likesCount: product.likesCount || 0
      };

      // Add isLiked status if user is authenticated
      if (userId) {
        productObj.isLiked = product.likes && product.likes.some(
          likeId => likeId.toString() === userId
        );
      } else {
        productObj.isLiked = false;
      }

      return productObj;
    });

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

    const isLiked = product.likes.some(likeId => likeId.toString() === userId);
    
    // Update product likes
    if (isLiked) {
      // Unlike
      product.likes = product.likes.filter(likeId => likeId.toString() !== userId);
      product.likesCount = Math.max(0, product.likesCount - 1);
    } else {
      // Like
      if (!product.likes.some(likeId => likeId.toString() === userId)) {
        product.likes.push(userId);
      }
      product.likesCount = product.likesCount + 1;
    }

    await product.save();

    // Update user's likedProducts array
    const user = await User.findById(userId);
    if (user) {
      if (isLiked) {
        // Remove from user's likedProducts
        user.likedProducts = user.likedProducts.filter(
          productId => productId.toString() !== id
        );
      } else {
        // Add to user's likedProducts
        if (!user.likedProducts.some(productId => productId.toString() === id)) {
          user.likedProducts.push(id);
        }
      }
      await user.save();
    }

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

// Get liked products for current user
export const getLikedProducts = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get all liked product IDs
    const likedProductIds = user.likedProducts || [];
    
    if (likedProductIds.length === 0) {
      return res.json({
        products: [],
        count: 0
      });
    }

    // Fetch products, filtering out any that might not exist anymore
    const products = await Product.find({
      _id: { $in: likedProductIds }
    });

    // Format products - filter out null/undefined products
    const formattedProducts = products
      .filter(product => product !== null && product !== undefined)
      .map(product => ({
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
        likesCount: product.likesCount || 0,
        isBestSeller: product.isBestSeller,
        salesCount: product.salesCount,
        isLiked: true // All products in this list are liked
      }));

    // Clean up any invalid product IDs from user's likedProducts
    if (products.length !== likedProductIds.length) {
      const validProductIds = products.map(p => p._id);
      user.likedProducts = validProductIds;
      await user.save();
    }

    console.log(`✅ Returning ${formattedProducts.length} liked products for user ${userId}`);

    res.json({
      products: formattedProducts,
      count: formattedProducts.length
    });
  } catch (error) {
    console.error('❌ Error fetching liked products:', error);
    res.status(500).json({
      message: 'Error fetching liked products',
      error: error.message,
      products: [] // Always return empty array on error
    });
  }
};

// Generate protein plan
export const generateProteinPlan = async (req, res) => {
  try {
    const { age, weight, height, activityLevel, goal } = req.body;

    if (!age || !weight || !height) {
      return res.status(400).json({
        message: 'Age, weight, and height are required'
      });
    }

    // Protein multipliers based on activity level
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.4,
      moderate: 1.6,
      active: 1.8,
      very_active: 2.0
    };

    // Goal adjustments
    const goalAdjustments = {
      maintenance: 0,
      muscle_gain: 0.3,
      weight_loss: 0.2
    };

    const baseMultiplier = activityMultipliers[activityLevel] || 1.6;
    const goalAdjustment = goalAdjustments[goal] || 0;
    const proteinMultiplier = baseMultiplier + goalAdjustment;

    // Calculate daily protein need
    const dailyProteinNeed = parseFloat(weight) * proteinMultiplier;

    // Distribute across meals: Breakfast (25%), Lunch (35%), Dinner (40%)
    const breakfastTarget = dailyProteinNeed * 0.25;
    const lunchTarget = dailyProteinNeed * 0.35;
    const dinnerTarget = dailyProteinNeed * 0.40;

    // Find products for each meal
    // For breakfast: look for products with protein content around breakfast target
    // For lunch and dinner: look for products with higher protein content
    const findProductsForMeal = async (targetProtein, mealType) => {
      // Search for products with protein content within a reasonable range
      const minProtein = Math.max(5, targetProtein * 0.3); // At least 30% of target
      const maxProtein = targetProtein * 2; // Up to 2x target

      const products = await Product.find({
        protein: { $gte: minProtein, $lte: maxProtein },
        stock: { $gt: 0 },
        status: 'active'
      })
      .sort({ protein: -1, isBestSeller: -1 })
      .limit(6); // Get top 6 products

      return products.map(product => ({
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
        nutritionalValue: product.nutritionalValue,
        isBestSeller: product.isBestSeller
      }));
    };

    const [breakfastProducts, lunchProducts, dinnerProducts] = await Promise.all([
      findProductsForMeal(breakfastTarget, 'breakfast'),
      findProductsForMeal(lunchTarget, 'lunch'),
      findProductsForMeal(dinnerTarget, 'dinner')
    ]);

    res.json({
      dailyProteinNeed,
      breakfast: {
        proteinTarget: breakfastTarget,
        products: breakfastProducts
      },
      lunch: {
        proteinTarget: lunchTarget,
        products: lunchProducts
      },
      dinner: {
        proteinTarget: dinnerTarget,
        products: dinnerProducts
      },
      recommendations: {
        activityLevel,
        goal,
        proteinMultiplier
      }
    });
  } catch (error) {
    console.error('Error generating protein plan:', error);
    res.status(500).json({
      message: 'Error generating protein plan',
      error: error.message
    });
  }
};
