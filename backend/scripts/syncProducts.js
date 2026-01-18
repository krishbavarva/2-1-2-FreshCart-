import axios from 'axios';
import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import Product from '../models/Product.js';

dotenv.config();

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org';

// Helper function to extract primary category
const extractPrimaryCategory = (categoriesString) => {
  if (!categoriesString) return 'Uncategorized';
  const categories = categoriesString.split(',').map(c => c.trim());
  if (categories.length > 0) {
    return categories[0].replace(/^[a-z]{2}:/i, '').trim();
  }
  return 'Uncategorized';
};

// Helper function to delay execution (rate limiting)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Sync products from Open Food Facts API
const syncProducts = async (maxPages = 100, pageSize = 100) => {
  try {
    console.log('🔄 Starting product sync from Open Food Facts API...');
    console.log(`📊 Configuration: Max pages: ${maxPages}, Page size: ${pageSize}`);
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalProcessed = 0;
    let page = 1;
    let hasMorePages = true;

    // Fetch products from API with pagination
    while (hasMorePages && page <= maxPages) {
      try {
        const url = `${OPEN_FOOD_FACTS_API}/cgi/search.pl?action=process&json=true&page_size=${pageSize}&page=${page}&json=1`;
        
        console.log(`\n📡 Fetching page ${page}/${maxPages} from Open Food Facts API...`);
        const response = await axios.get(url, {
          timeout: 30000, // 30 second timeout
          headers: {
            'User-Agent': 'FreshCart-Grocery-App/1.0 (https://github.com/yourusername/freshcart)'
          }
        });
        
        const data = response.data;
        const products = data.products || [];
        const count = data.count || 0;
        const pageCount = data.page_count || 0;

        if (products.length === 0) {
          console.log(`⚠️  No products found on page ${page}. Stopping sync.`);
          hasMorePages = false;
          break;
        }

        console.log(`📦 Found ${products.length} products on page ${page}`);
        if (page === 1) {
          console.log(`📊 Total products available: ${count}, Total pages: ${pageCount}`);
        }

        const productsToProcess = [];

        // Process products
        for (const product of products) {
          if (!product.product_name || !product.code) {
            continue;
          }

          const categoriesString = product.categories || product.categories_tags?.join(',') || '';
          const primaryCategory = extractPrimaryCategory(categoriesString);

          // Extract Nutri-Score (French nutritional grade system)
          const nutriscoreGrade = product.nutriscore_grade 
            ? product.nutriscore_grade.toUpperCase() 
            : null;
          const nutriscoreScore = product.nutriscore_score || null;

          // Extract protein (per 100g)
          const protein = product.nutriments?.proteins_100g || 
                         product.nutriments?.proteins || 
                         product.nutriments?.['proteins-value'] || 
                         null;

          // Extract nutritional values (per 100g)
          const nutritionalValue = {
            energy: product.nutriments?.['energy-kcal_100g'] || 
                    product.nutriments?.['energy-kcal'] || 
                    product.nutriments?.['energy-kcal-value'] || 
                    null,
            fat: product.nutriments?.fat_100g || 
                 product.nutriments?.fat || 
                 product.nutriments?.['fat-value'] || 
                 null,
            saturatedFat: product.nutriments?.['saturated-fat_100g'] || 
                         product.nutriments?.['saturated-fat'] || 
                         null,
            carbs: product.nutriments?.carbohydrates_100g || 
                   product.nutriments?.carbohydrates || 
                   product.nutriments?.['carbohydrates-value'] || 
                   null,
            sugars: product.nutriments?.sugars_100g || 
                    product.nutriments?.sugars || 
                    product.nutriments?.['sugars-value'] || 
                    null,
            fiber: product.nutriments?.fiber_100g || 
                   product.nutriments?.fiber || 
                   product.nutriments?.['fiber-value'] || 
                   null,
            salt: product.nutriments?.salt_100g || 
                  product.nutriments?.salt || 
                  product.nutriments?.['salt-value'] || 
                  null
          };

          // Calculate price based on product type and nutritional value
          let calculatedPrice = 10; // Default base price
          if (product.price && product.price > 0) {
            calculatedPrice = parseFloat(product.price);
          } else {
            // Calculate price based on category and nutritional value
            const categoryMultiplier = primaryCategory.toLowerCase().includes('organic') ? 1.5 :
                                       primaryCategory.toLowerCase().includes('premium') ? 1.3 : 1.0;
            const nutritionMultiplier = nutriscoreGrade === 'A' ? 1.2 : 
                                        nutriscoreGrade === 'B' ? 1.1 : 1.0;
            calculatedPrice = (5 + Math.random() * 20) * categoryMultiplier * nutritionMultiplier;
            calculatedPrice = Math.round(calculatedPrice * 100) / 100; // Round to 2 decimals
          }

          // Default stock
          let initialStock = 50;
          
          const productData = {
            productId: product.code,
            name: product.product_name,
            brand: product.brands || '',
            price: calculatedPrice,
            image: product.image_url || product.image_front_url || '',
            category: primaryCategory,
            barcode: product.code || product.product_id || '',
            stock: initialStock,
            minStockLevel: 10,
            maxStockLevel: 1000,
            unit: 'piece',
            status: 'active',
            description: product.ingredients_text || '',
            nutriscoreGrade: nutriscoreGrade && ['A', 'B', 'C', 'D', 'E'].includes(nutriscoreGrade) 
              ? nutriscoreGrade 
              : null,
            nutriscoreScore: nutriscoreScore,
            protein: protein ? parseFloat(protein) : null,
            nutritionalValue: nutritionalValue,
            likes: [],
            likesCount: 0,
            isBestSeller: false,
            salesCount: 0
          };

          productsToProcess.push(productData);
        }

        // Insert or update products in batch
        let created = 0;
        let updated = 0;
        
        for (const productData of productsToProcess) {
          try {
            const existingProduct = await Product.findOne({ productId: productData.productId });
            
            if (existingProduct) {
              // Update existing product but preserve stock, price, likes, and sales data
              await Product.findOneAndUpdate(
                { productId: productData.productId },
                {
                  name: productData.name,
                  brand: productData.brand,
                  image: productData.image,
                  category: productData.category,
                  barcode: productData.barcode,
                  description: productData.description,
                  nutriscoreGrade: productData.nutriscoreGrade,
                  nutriscoreScore: productData.nutriscoreScore,
                  protein: productData.protein,
                  nutritionalValue: productData.nutritionalValue,
                  // Preserve existing values
                  stock: existingProduct.stock !== undefined ? existingProduct.stock : productData.stock,
                  price: existingProduct.price !== undefined ? existingProduct.price : productData.price,
                  likes: existingProduct.likes || [],
                  likesCount: existingProduct.likesCount || 0,
                  isBestSeller: existingProduct.isBestSeller || false,
                  salesCount: existingProduct.salesCount || 0
                },
                { upsert: true, new: true }
              );
              updated++;
            } else {
              // Create new product with default stock
              await Product.create(productData);
              created++;
            }
          } catch (error) {
            console.error(`❌ Error processing product ${productData.productId}:`, error.message);
          }
        }

        totalCreated += created;
        totalUpdated += updated;
        totalProcessed += productsToProcess.length;

        console.log(`✅ Page ${page} complete: ${created} created, ${updated} updated`);
        console.log(`📊 Total progress: ${totalCreated} created, ${totalUpdated} updated, ${totalProcessed} processed`);

        // Check if there are more pages
        if (page >= pageCount || products.length < pageSize) {
          hasMorePages = false;
          console.log('✅ Reached end of available products');
        } else {
          page++;
          // Rate limiting: wait 1 second between pages to avoid overwhelming the API
          console.log('⏳ Waiting 1 second before next page (rate limiting)...');
          await delay(1000);
        }
      } catch (error) {
        console.error(`❌ Error fetching page ${page}:`, error.message);
        if (error.response?.status === 429) {
          console.log('⚠️  Rate limit hit. Waiting 5 seconds...');
          await delay(5000);
          // Retry the same page
          continue;
        } else {
          // Skip to next page on other errors
          page++;
          await delay(2000);
        }
      }
    }

    console.log(`\n🎉 Sync complete!`);
    console.log(`📊 Final statistics:`);
    console.log(`   - Total pages processed: ${page - 1}`);
    console.log(`   - Total products created: ${totalCreated}`);
    console.log(`   - Total products updated: ${totalUpdated}`);
    console.log(`   - Total products processed: ${totalProcessed}`);

    // Post-processing: Set stock levels and best sellers
    console.log('\n🔧 Post-processing: Setting stock levels and best sellers...');
    
    // Set some products to low stock (< 30)
    const productsForLowStock = await Product.find({ 
      stock: { $gte: 30 }
    }).limit(50);
    
    const lowStockValues = [15, 20, 25, 28, 18, 22, 24, 26, 19, 21];
    
    for (let i = 0; i < Math.min(productsForLowStock.length, 50); i++) {
      await Product.findByIdAndUpdate(productsForLowStock[i]._id, { 
        stock: lowStockValues[i % lowStockValues.length] || 20,
        status: 'active'
      });
    }
    console.log(`📉 Set ${Math.min(productsForLowStock.length, 50)} products to low stock`);

    // Set some products to out of stock (0)
    const productsForOutOfStock = await Product.find({ 
      stock: { $gt: 0 }
    }).limit(30);
    
    for (let i = 0; i < Math.min(productsForOutOfStock.length, 30); i++) {
      await Product.findByIdAndUpdate(productsForOutOfStock[i]._id, { 
        stock: 0,
        status: 'out_of_stock'
      });
    }
    console.log(`❌ Set ${Math.min(productsForOutOfStock.length, 30)} products to out of stock`);

    // Mark top products as best sellers based on various criteria
    const allProducts = await Product.find({}).sort({ 
      protein: -1,
      nutriscoreScore: -1,
      createdAt: -1 
    }).limit(100);
    
    // Mark top 20 products as best sellers
    const bestSellerCount = Math.min(20, allProducts.length);
    for (let i = 0; i < bestSellerCount; i++) {
      await Product.findByIdAndUpdate(allProducts[i]._id, { 
        isBestSeller: true,
        salesCount: Math.floor(Math.random() * 200) + 100 // Random sales count 100-300
      });
    }
    console.log(`⭐ Marked ${bestSellerCount} products as best sellers`);

    // Get final statistics
    const totalProducts = await Product.countDocuments({});
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const bestSellers = await Product.countDocuments({ isBestSeller: true });
    
    console.log('\n📊 Final Database Statistics:');
    console.log(`   - Total products in database: ${totalProducts}`);
    console.log(`   - Active products: ${activeProducts}`);
    console.log(`   - Best sellers: ${bestSellers}`);
    console.log('🎉 Product sync completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing products:', error);
    process.exit(1);
  }
};

// Get command line arguments
const args = process.argv.slice(2);
const maxPages = args[0] ? parseInt(args[0]) : 100; // Default: 100 pages (10,000 products with pageSize=100)
const pageSize = args[1] ? parseInt(args[1]) : 100; // Default: 100 products per page

// Run sync
console.log('🚀 Starting Open Food Facts product sync...');
console.log(`📋 Parameters: maxPages=${maxPages}, pageSize=${pageSize}`);
console.log(`📊 Expected products: up to ${maxPages * pageSize} products\n`);

syncProducts(maxPages, pageSize);
