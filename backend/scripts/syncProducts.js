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

// Sync products from Open Food Facts API
const syncProducts = async () => {
  try {
    console.log('🔄 Starting product sync...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Fetch products from API
    const pageSize = 50;
    const url = `${OPEN_FOOD_FACTS_API}/cgi/search.pl?action=process&json=true&page_size=${pageSize}&page=1`;
    
    console.log('📡 Fetching products from Open Food Facts API...');
    const response = await axios.get(url);
    const products = response.data.products || [];

    if (products.length === 0) {
      console.log('⚠️  No products found in API response');
      return;
    }

    console.log(`📦 Found ${products.length} products to sync`);

    let created = 0;
    let updated = 0;
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
      // Base price calculation: $5-30 range based on category and nutritional value
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

      // Handle stock from API (if available) or set default
      // API doesn't provide stock, so we'll set it based on our logic
      let initialStock = 50; // Default stock
      
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

    // Insert or update products
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

    console.log(`✅ Sync complete: ${created} created, ${updated} updated`);

    // Set some products to low stock (< 30) - only for newly created products
    const productsForLowStock = await Product.find({ 
      stock: { $gte: 30 },
      createdAt: { $gte: new Date(Date.now() - 60000) } // Created in last minute
    }).limit(4);
    
    const lowStockValues = [15, 20, 25, 28]; // Different values for variety
    
    for (let i = 0; i < Math.min(productsForLowStock.length, 4); i++) {
      await Product.findByIdAndUpdate(productsForLowStock[i]._id, { 
        stock: lowStockValues[i] || 20,
        status: 'active'
      });
      console.log(`📉 Set ${productsForLowStock[i].name} to low stock: ${lowStockValues[i] || 20}`);
    }

    // Set some products to out of stock (0) - only for newly created products
    const productsForOutOfStock = await Product.find({ 
      stock: { $gt: 0 },
      createdAt: { $gte: new Date(Date.now() - 60000) } // Created in last minute
    }).limit(4);
    
    for (let i = 0; i < Math.min(productsForOutOfStock.length, 4); i++) {
      await Product.findByIdAndUpdate(productsForOutOfStock[i]._id, { 
        stock: 0,
        status: 'out_of_stock'
      });
      console.log(`❌ Set ${productsForOutOfStock[i].name} to out of stock`);
    }

    // Mark top 10 products by sales as best sellers (if sales data exists)
    // For now, randomly mark some products as best sellers
    const allProductsForBestSeller = await Product.find({}).limit(10);
    const bestSellerIndices = [0, 2, 4, 6, 8]; // Mark every other product as best seller
    
    for (let i = 0; i < bestSellerIndices.length && bestSellerIndices[i] < allProductsForBestSeller.length; i++) {
      const idx = bestSellerIndices[i];
      await Product.findByIdAndUpdate(allProductsForBestSeller[idx]._id, { 
        isBestSeller: true,
        salesCount: Math.floor(Math.random() * 100) + 50 // Random sales count 50-150
      });
      console.log(`⭐ Marked ${allProductsForBestSeller[idx].name} as best seller`);
    }

    console.log('✅ Stock levels configured: 3-4 low stock, 3-4 out of stock');
    console.log('✅ Best sellers marked');
    console.log('🎉 Product sync completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing products:', error);
    process.exit(1);
  }
};

// Run sync
syncProducts();

