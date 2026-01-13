// Test cart operations with authentication
import axios from 'axios';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

console.log('\n🔍 Testing Cart with Authentication...\n');

// First, try to login or register to get a valid token
async function getAuthToken() {
  try {
    // Try to login with test credentials (you may need to adjust)
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    }, {
      validateStatus: () => true
    });

    if (loginResponse.status === 200 && loginResponse.data.token) {
      console.log('✅ Got token from login');
      return loginResponse.data.token;
    }

    // If login fails, try to register
    console.log('⚠️  Login failed, trying to register...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'test123'
    }, {
      validateStatus: () => true
    });

    if (registerResponse.status === 201 && registerResponse.data.token) {
      console.log('✅ Got token from registration');
      return registerResponse.data.token;
    }

    console.log('❌ Could not get auth token');
    return null;
  } catch (error) {
    console.error('❌ Error getting token:', error.message);
    return null;
  }
}

// Test cart operations
async function testCartOperations(token) {
  const headers = {
    Authorization: `Bearer ${token}`
  };

  console.log('\n📦 Testing Cart Operations:\n');

  // Test 1: Get cart
  try {
    console.log('Test 1: GET /api/cart');
    const response = await axios.get(`${BASE_URL}/api/cart`, { headers });
    console.log('   ✅ Success!');
    console.log('   Cart ID:', response.data.cart?._id);
    console.log('   Items:', response.data.itemCount);
    return true;
  } catch (error) {
    console.log('   ❌ Failed!');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error || error.message);
    console.log('   Details:', error.response?.data);
    return false;
  }
}

// Test 2: Add to cart
async function testAddToCart(token) {
  const headers = {
    Authorization: `Bearer ${token}`
  };

  try {
    console.log('\nTest 2: POST /api/cart');
    const response = await axios.post(`${BASE_URL}/api/cart`, {
      productId: 'test-product-123',
      name: 'Test Product',
      brand: 'Test Brand',
      price: 9.99,
      image: 'https://example.com/image.jpg',
      quantity: 1,
      category: 'Test Category'
    }, { headers });
    
    console.log('   ✅ Success!');
    console.log('   Message:', response.data.message);
    console.log('   Items in cart:', response.data.itemCount);
    return true;
  } catch (error) {
    console.log('   ❌ Failed!');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error || error.message);
    console.log('   Details:', JSON.stringify(error.response?.data, null, 2));
    return false;
  }
}

// Main test
async function runTests() {
  const token = await getAuthToken();
  
  if (!token) {
    console.log('\n❌ Cannot proceed without auth token');
    console.log('💡 Please login through the frontend first, then check backend logs');
    process.exit(1);
  }

  // Decode token to see user ID
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('🔐 Token decoded - User ID:', decoded.userId, 'Type:', typeof decoded.userId);
  } catch (error) {
    console.log('❌ Error decoding token:', error.message);
  }

  const test1 = await testCartOperations(token);
  const test2 = await testAddToCart(token);

  console.log('\n' + '='.repeat(50));
  if (test1 && test2) {
    console.log('✅ All cart tests passed!');
  } else {
    console.log('❌ Some tests failed. Check errors above.');
    console.log('\n💡 Check backend console for detailed error logs.');
  }
  console.log('='.repeat(50) + '\n');

  process.exit(0);
}

runTests();



