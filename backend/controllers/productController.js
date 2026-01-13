import axios from 'axios';

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

// Get products from Open Food Facts API
export const getProducts = async (req, res) => {
  try {
    const { search, page = 1, category } = req.query;
    const pageSize = 24;

    let url = `${OPEN_FOOD_FACTS_API}/cgi/search.pl?action=process&json=true&page_size=${pageSize}&page=${page}`;
    
    if (search) {
      url += `&search_terms=${encodeURIComponent(search)}`;
    }
    
    // Add category filter to Open Food Facts API if provided
    if (category && category !== 'all') {
      url += `&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}`;
    }

    const response = await axios.get(url);
    const products = response.data.products || [];

    // Format products for frontend
    let formattedProducts = products
      .filter(product => product.product_name && product.image_url)
      .map(product => {
        const categoriesString = product.categories || product.categories_tags?.join(',') || '';
        const primaryCategory = extractPrimaryCategory(categoriesString);
        
        return {
          id: product.code || product._id,
          name: product.product_name || 'Unknown Product',
          brand: product.brands || '',
          price: product.price || 0,
          image: product.image_url || product.image_front_url || '',
          category: primaryCategory,
          categories: categoriesString,
          nutritionalInfo: {
            energy: product.nutriments?.energy_kcal_100g || 0,
            fat: product.nutriments?.fat_100g || 0,
            carbs: product.nutriments?.carbohydrates_100g || 0,
            protein: product.nutriments?.proteins_100g || 0,
          },
          quantity: product.quantity || '',
          barcode: product.code || ''
        };
      });

    // Additional client-side filtering by category if needed (for more precise filtering)
    if (category && category !== 'all') {
      formattedProducts = formattedProducts.filter(product => 
        product.category.toLowerCase().includes(category.toLowerCase()) ||
        product.categories.toLowerCase().includes(category.toLowerCase())
      );
    }

    res.json({
      products: formattedProducts,
      page: parseInt(page),
      pageSize,
      total: response.data.count || formattedProducts.length,
      category: category || 'all'
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Error fetching products from Open Food Facts API',
      error: error.message
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        message: 'Search query is required'
      });
    }

    const url = `${OPEN_FOOD_FACTS_API}/cgi/search.pl?action=process&search_terms=${encodeURIComponent(q)}&json=true&page_size=20`;

    const response = await axios.get(url);
    const products = response.data.products || [];

    const formattedProducts = products
      .filter(product => product.product_name && product.image_url)
      .map(product => ({
        id: product.code || product._id,
        name: product.product_name || 'Unknown Product',
        brand: product.brands || '',
        price: product.price || 0,
        image: product.image_url || product.image_front_url || '',
        category: extractPrimaryCategory(product.categories || product.categories_tags?.join(',') || ''),
        categories: product.categories || product.categories_tags?.join(',') || '',
        barcode: product.code || ''
      }));

    res.json({
      products: formattedProducts,
      query: q,
      total: formattedProducts.length
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      message: 'Error searching products',
      error: error.message
    });
  }
};

// Get available categories from products
export const getCategories = async (req, res) => {
  try {
    // Fetch a sample of products to extract categories
    const url = `${OPEN_FOOD_FACTS_API}/cgi/search.pl?action=process&json=true&page_size=100&page=1`;
    
    const response = await axios.get(url);
    const products = response.data.products || [];

    // Extract unique categories
    const categorySet = new Set();
    
    products.forEach(product => {
      if (product.categories) {
        const categories = product.categories.split(',').map(c => {
          // Remove language prefixes and clean up
          return c.trim().replace(/^[a-z]{2}:/i, '').trim();
        });
        categories.forEach(cat => {
          if (cat && cat.length > 0) {
            categorySet.add(cat);
          }
        });
      }
      
      // Also check categories_tags if available
      if (product.categories_tags && Array.isArray(product.categories_tags)) {
        product.categories_tags.forEach(tag => {
          const cleanTag = tag.replace(/^[a-z]{2}:/i, '').trim();
          if (cleanTag && cleanTag.length > 0) {
            categorySet.add(cleanTag);
          }
        });
      }
    });

    // Convert to sorted array
    const categories = Array.from(categorySet)
      .filter(cat => cat && cat.length > 0)
      .sort()
      .slice(0, 50); // Limit to top 50 categories

    res.json({
      categories: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get product by ID (barcode)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const url = `${OPEN_FOOD_FACTS_API}/api/v0/product/${id}.json`;

    const response = await axios.get(url);

    if (response.data.status === 0) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    const product = response.data.product;

    const formattedProduct = {
      id: product.code || id,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || '',
      price: product.price || 0,
      image: product.image_url || product.image_front_url || '',
      category: product.categories || '',
      nutritionalInfo: {
        energy: product.nutriments?.energy_kcal_100g || 0,
        fat: product.nutriments?.fat_100g || 0,
        carbs: product.nutriments?.carbohydrates_100g || 0,
        protein: product.nutriments?.proteins_100g || 0,
        fiber: product.nutriments?.fiber_100g || 0,
        salt: product.nutriments?.salt_100g || 0,
      },
      quantity: product.quantity || '',
      barcode: product.code || '',
      ingredients: product.ingredients_text || '',
      allergens: product.allergens || '',
      labels: product.labels || ''
    };

    res.json({ product: formattedProduct });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: 'Error fetching product from Open Food Facts API',
      error: error.message
    });
  }
};

