// Test script to check user and password
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery';

const testUser = async () => {
  try {
    console.log('\n🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = 'krish@gmail.com';
    const testPassword = '123456';

    console.log(`🔍 Looking for user: ${email}`);
    
    // Try to find user with password
    let user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('📋 User ID:', user._id);
    console.log('📋 User name:', user.firstName, user.lastName);
    console.log('📋 User email:', user.email);
    console.log('\n🔍 Checking password field...');
    
    // Check for both password and passwordHash (backward compatibility)
    const userObj = user.toObject();
    const hasPassword = !!userObj.password;
    const hasPasswordHash = !!userObj.passwordHash;
    const passwordValue = userObj.password || userObj.passwordHash;
    
    console.log('   Password field exists:', hasPassword);
    console.log('   PasswordHash field exists:', hasPasswordHash);
    console.log('   Password value type:', typeof passwordValue);
    console.log('   Password length:', passwordValue ? passwordValue.length : 'N/A');
    console.log('   Password starts with $2b$:', passwordValue ? passwordValue.startsWith('$2b$') : 'N/A');
    
    if (!passwordValue) {
      console.log('\n❌ ERROR: Password field is missing!');
      console.log('💡 Solution: Delete this user and re-register');
      console.log('\n📋 User document fields:', Object.keys(userObj));
      process.exit(1);
    }

    // Set passwordHash to password if it exists (for comparison)
    if (userObj.passwordHash && !userObj.password) {
      user.passwordHash = userObj.passwordHash;
    }

    console.log('\n🔒 Testing password comparison...');
    const isValid = await user.comparePassword(testPassword);
    
    if (isValid) {
      console.log('✅ Password is correct!');
    } else {
      console.log('❌ Password is incorrect');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

testUser();

