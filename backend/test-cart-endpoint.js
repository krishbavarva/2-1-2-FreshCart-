// Test script to check cart endpoint
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

console.log('\n🔍 Testing Cart Endpoint...\n');

// Test 1: Check if route exists (should get 401 without token)
async function testCartRoute() {
  try {
    const response = await axios.get(`${BASE_URL}/api/cart`, {
      validateStatus: () => true // Don't throw on any status
    });
    
    console.log('Test 1: GET /api/cart');
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('   ✅ Route exists (401 Unauthorized - expected without token)');
      return true;
    } else if (response.status === 404) {
      console.log('   ❌ Route not found (404)');
      console.log('   Response:', response.data);
      return false;
    } else if (response.status === 500) {
      console.log('   ⚠️  Server error (500)');
      console.log('   Error:', response.data);
      return false;
    } else {
      console.log('   ⚠️  Unexpected status');
      console.log('   Response:', response.data);
      return response.status !== 404;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Server not running');
      return false;
    } else {
      console.log('   ❌ Error:', error.message);
      return false;
    }
  }
}

// Test 2: Check route registration
async function testRouteRegistration() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, {
      validateStatus: () => true
    });
    
    console.log('\nTest 2: Health Check');
    if (response.status === 200) {
      console.log('   ✅ Server is running');
      const data = response.data;
      console.log(`   MongoDB: ${data.mongodb}`);
      console.log(`   Database: ${data.database}`);
      return true;
    } else {
      console.log('   ❌ Health check failed');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  const test1 = await testRouteRegistration();
  const test2 = await testCartRoute();
  
  console.log('\n' + '='.repeat(50));
  if (test1 && test2) {
    console.log('✅ All tests passed! Cart route is accessible.');
    console.log('\n💡 The 500 error might be due to:');
    console.log('   1. Invalid user ID format');
    console.log('   2. Database connection issue');
    console.log('   3. Missing user authentication');
    console.log('\n   Check backend console logs for detailed error messages.');
  } else {
    console.log('❌ Some tests failed. Check the errors above.');
  }
  console.log('='.repeat(50) + '\n');
  
  process.exit(0);
}

runTests();



