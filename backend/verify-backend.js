// Comprehensive backend verification script
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 Verifying Backend Setup...\n');

const checks = [];
let allPassed = true;

// Check 1: Verify all route files exist and can be imported
try {
  console.log('1. Checking route imports...');
  const authRoutes = await import('./routes/authRoutes.js');
  const productRoutes = await import('./routes/productRoutes.js');
  const cartRoutes = await import('./routes/cartRoutes.js');
  const orderRoutes = await import('./routes/orderRoutes.js');
  
  if (authRoutes.default && productRoutes.default && cartRoutes.default && orderRoutes.default) {
    console.log('   ✅ All route files imported successfully');
    checks.push({ name: 'Route Imports', status: 'PASS' });
  } else {
    console.log('   ❌ Some route files missing default export');
    checks.push({ name: 'Route Imports', status: 'FAIL' });
    allPassed = false;
  }
} catch (error) {
  console.log('   ❌ Error importing routes:', error.message);
  checks.push({ name: 'Route Imports', status: 'FAIL', error: error.message });
  allPassed = false;
}

// Check 2: Verify all controller files exist and can be imported
try {
  console.log('2. Checking controller imports...');
  const cartController = await import('./controllers/cartController.js');
  const orderController = await import('./controllers/orderController.js');
  
  const requiredCartMethods = ['getCart', 'addToCart', 'updateCartItem', 'removeFromCart', 'clearCart'];
  const requiredOrderMethods = ['createOrder', 'getOrders', 'getOrderById', 'cancelOrder'];
  
  const cartMethodsExist = requiredCartMethods.every(method => typeof cartController[method] === 'function');
  const orderMethodsExist = requiredOrderMethods.every(method => typeof orderController[method] === 'function');
  
  if (cartMethodsExist && orderMethodsExist) {
    console.log('   ✅ All controller methods exported');
    checks.push({ name: 'Controller Exports', status: 'PASS' });
  } else {
    console.log('   ❌ Some controller methods missing');
    checks.push({ name: 'Controller Exports', status: 'FAIL' });
    allPassed = false;
  }
} catch (error) {
  console.log('   ❌ Error importing controllers:', error.message);
  checks.push({ name: 'Controller Exports', status: 'FAIL', error: error.message });
  allPassed = false;
}

// Check 3: Verify all model files exist
try {
  console.log('3. Checking model imports...');
  const Cart = await import('./models/Cart.js');
  const Order = await import('./models/Order.js');
  const User = await import('./models/User.js');
  
  if (Cart.default && Order.default && User.default) {
    console.log('   ✅ All model files imported successfully');
    checks.push({ name: 'Model Imports', status: 'PASS' });
  } else {
    console.log('   ❌ Some model files missing default export');
    checks.push({ name: 'Model Imports', status: 'FAIL' });
    allPassed = false;
  }
} catch (error) {
  console.log('   ❌ Error importing models:', error.message);
  checks.push({ name: 'Model Imports', status: 'FAIL', error: error.message });
  allPassed = false;
}

// Check 4: Verify middleware
try {
  console.log('4. Checking middleware...');
  const authMiddleware = await import('./middleware/authMiddleware.js');
  
  if (typeof authMiddleware.authenticate === 'function') {
    console.log('   ✅ Authentication middleware exported');
    checks.push({ name: 'Middleware', status: 'PASS' });
  } else {
    console.log('   ❌ Authentication middleware not found');
    checks.push({ name: 'Middleware', status: 'FAIL' });
    allPassed = false;
  }
} catch (error) {
  console.log('   ❌ Error importing middleware:', error.message);
  checks.push({ name: 'Middleware', status: 'FAIL', error: error.message });
  allPassed = false;
}

// Check 5: Verify database config
try {
  console.log('5. Checking database configuration...');
  const dbConfig = await import('./config/database.js');
  
  const requiredExports = ['connectDB', 'isDBConnected', 'getConnectionStatus', 'mongoose'];
  const exportsExist = requiredExports.every(exp => dbConfig[exp] !== undefined);
  
  if (exportsExist) {
    console.log('   ✅ Database configuration complete');
    checks.push({ name: 'Database Config', status: 'PASS' });
  } else {
    console.log('   ❌ Missing database exports');
    checks.push({ name: 'Database Config', status: 'FAIL' });
    allPassed = false;
  }
} catch (error) {
  console.log('   ❌ Error importing database config:', error.message);
  checks.push({ name: 'Database Config', status: 'FAIL', error: error.message });
  allPassed = false;
}

// Check 6: Verify app.js can be imported
try {
  console.log('6. Checking main app file...');
  const app = await import('./app.js');
  
  if (app.default && typeof app.default.listen === 'function') {
    console.log('   ✅ App file is valid Express app');
    checks.push({ name: 'App File', status: 'PASS' });
  } else {
    console.log('   ❌ App file is not a valid Express app');
    checks.push({ name: 'App File', status: 'FAIL' });
    allPassed = false;
  }
} catch (error) {
  console.log('   ❌ Error importing app:', error.message);
  checks.push({ name: 'App File', status: 'FAIL', error: error.message });
  allPassed = false;
}

// Summary
console.log('\n📊 Verification Summary:');
console.log('='.repeat(50));
checks.forEach(check => {
  const icon = check.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${check.name}: ${check.status}`);
  if (check.error) {
    console.log(`   Error: ${check.error}`);
  }
});
console.log('='.repeat(50));

if (allPassed) {
  console.log('\n✅ All checks passed! Backend is properly configured.\n');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed. Please review the errors above.\n');
  process.exit(1);
}



