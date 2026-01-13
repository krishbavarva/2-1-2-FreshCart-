// Quick script to check if routes are accessible
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

console.log('\n🔍 Checking Backend Routes...\n');

const routes = [
  { method: 'GET', path: '/health', auth: false },
  { method: 'GET', path: '/api/health/db', auth: false },
  { method: 'GET', path: '/api/cart', auth: true, name: 'Cart' },
  { method: 'GET', path: '/api/orders', auth: true, name: 'Orders' },
];

async function checkRoute(route) {
  try {
    const config = {
      method: route.method,
      url: `${BASE_URL}${route.path}`,
      validateStatus: () => true, // Don't throw on any status
    };

    if (route.auth) {
      config.headers = {
        Authorization: 'Bearer test-token'
      };
    }

    const response = await axios(config);
    
    if (response.status === 404) {
      console.log(`❌ ${route.method} ${route.path} - NOT FOUND (404)`);
      if (route.name) {
        console.log(`   ⚠️  ${route.name} routes are not registered!`);
        console.log(`   💡 Solution: Restart the backend server`);
      }
      return false;
    } else if (response.status === 401) {
      console.log(`✅ ${route.method} ${route.path} - Found (401 Unauthorized - expected)`);
      return true;
    } else if (response.status === 200 || response.status === 503) {
      console.log(`✅ ${route.method} ${route.path} - Found (${response.status})`);
      return true;
    } else {
      console.log(`⚠️  ${route.method} ${route.path} - Status: ${response.status}`);
      return response.status !== 404;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`❌ ${route.method} ${route.path} - Server not running`);
      return false;
    } else {
      console.log(`❌ ${route.method} ${route.path} - Error: ${error.message}`);
      return false;
    }
  }
}

async function checkAllRoutes() {
  const results = await Promise.all(routes.map(checkRoute));
  const allFound = results.every(r => r);
  
  console.log('\n' + '='.repeat(50));
  if (allFound) {
    console.log('✅ All routes are accessible!');
  } else {
    console.log('❌ Some routes are missing!');
    console.log('\n💡 To fix:');
    console.log('   1. Stop the backend server (Ctrl+C)');
    console.log('   2. Restart: cd backend && npm run dev');
    console.log('   3. Verify routes are registered in console output');
  }
  console.log('='.repeat(50) + '\n');
}

checkAllRoutes();



