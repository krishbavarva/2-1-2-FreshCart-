// Quick test script to check MongoDB connection
import { connectDB, getConnectionStatus, closeConnection } from './config/database.js';

console.log('\n🔍 Testing MongoDB Connection...');

// Connect to MongoDB
connectDB()
  .then(async () => {
    // Wait a bit for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const status = getConnectionStatus();
    console.log('\n✅ MongoDB Connection Test Results:');
    console.log('   Status:', status.status);
    console.log('   Connected:', status.connected ? 'Yes' : 'No');
    console.log('   Database:', status.database);
    console.log('   Host:', status.host);
    console.log('   Port:', status.port);
    
    await closeConnection();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n❌ MongoDB Connection Test Failed!');
    console.error('Error:', error.message);
    await closeConnection();
    process.exit(1);
  });

