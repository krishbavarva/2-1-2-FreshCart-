// Test script to reproduce and show the 500 error
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

console.log('\n🔍 Testing Cart Endpoint to Reproduce 500 Error...\n');

// First, try to get a valid token by logging in
async function getToken() {
  try {
    // Try common test credentials or register a new user
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'test123456'
    }, {
      validateStatus: () => true
    });

    if (registerResponse.status === 201 && registerResponse.data.token) {
      console.log('✅ Got token from registration');
      return registerResponse.data.token;
    }

    // Try login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'test123456'
    }, {
      validateStatus: () => true
    });

    if (loginResponse.status === 200 && loginResponse.data.token) {
      console.log('✅ Got token from login');
      return loginResponse.data.token;
    }

    console.log('⚠️  Could not get token. Using test token...');
    return 'test-token';
  } catch (error) {
    console.log('⚠️  Error getting token:', error.message);
    return 'test-token';
  }
}

async function testCartWithToken(token) {
  const headers = {
    Authorization: `Bearer ${token}`
  };

  console.log('\n📦 Testing GET /api/cart with token...\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/cart`, { 
      headers,
      validateStatus: () => true // Don't throw on any status
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 500) {
      console.log('\n❌ 500 INTERNAL SERVER ERROR DETECTED!');
      console.log('\nError Details:');
      console.log('='.repeat(60));
      console.log('Message:', response.data.message || 'Internal Server Error');
      console.log('Error:', response.data.error || 'No error message');
      if (response.data.stack) {
        console.log('\nStack Trace:');
        console.log(response.data.stack);
      }
      if (response.data.errorName) {
        console.log('Error Name:', response.data.errorName);
      }
      if (response.data.errorCode) {
        console.log('Error Code:', response.data.errorCode);
      }
      console.log('='.repeat(60));
    } else if (response.status === 401) {
      console.log('⚠️  401 Unauthorized - Token might be invalid');
      console.log('   Try logging in through the frontend first');
    } else if (response.status === 200) {
      console.log('✅ Cart loaded successfully!');
    }
    
    return response.status;
  } catch (error) {
    if (error.response) {
      console.log('\n❌ ERROR RESPONSE:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('\n❌ NETWORK ERROR:', error.message);
    }
    return error.response?.status || 0;
  }
}

async function testAddToCart(token) {
  const headers = {
    Authorization: `Bearer ${token}`
  };

  console.log('\n📦 Testing POST /api/cart (Add to Cart)...\n');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/cart`, {
      productId: 'test-product-123',
      name: 'Test Product',
      brand: 'Test Brand',
      price: 9.99,
      image: 'https://example.com/image.jpg',
      quantity: 1,
      category: 'Test Category'
    }, { 
      headers,
      validateStatus: () => true
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 500) {
      console.log('\n❌ 500 INTERNAL SERVER ERROR DETECTED!');
      console.log('\nError Details:');
      console.log('='.repeat(60));
      console.log('Message:', response.data.message || 'Internal Server Error');
      console.log('Error:', response.data.error || 'No error message');
      if (response.data.stack) {
        console.log('\nStack Trace:');
        console.log(response.data.stack);
      }
      if (response.data.errorName) {
        console.log('Error Name:', response.data.errorName);
      }
      if (response.data.errorCode) {
        console.log('Error Code:', response.data.errorCode);
      }
      console.log('='.repeat(60));
    }
    
    return response.status;
  } catch (error) {
    if (error.response) {
      console.log('\n❌ ERROR RESPONSE:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('\n❌ NETWORK ERROR:', error.message);
    }
    return error.response?.status || 0;
  }
}

async function main() {
  const token = await getToken();
  
  if (!token || token === 'test-token') {
    console.log('\n⚠️  Note: Using invalid token for testing');
    console.log('   For real testing, please login through the frontend first\n');
  }

  const status1 = await testCartWithToken(token);
  const status2 = await testAddToCart(token);
  
  console.log('\n' + '='.repeat(60));
  console.log('Test Results:');
  console.log('  GET /api/cart:', status1 === 500 ? '❌ 500 Error' : status1 === 200 ? '✅ Success' : `Status ${status1}`);
  console.log('  POST /api/cart:', status2 === 500 ? '❌ 500 Error' : status2 === 200 ? '✅ Success' : `Status ${status2}`);
  console.log('='.repeat(60));
  console.log('\n💡 Check the backend server console for detailed error logs!');
  console.log('   The server should show detailed error messages with stack traces.\n');
}

main().catch(console.error);



