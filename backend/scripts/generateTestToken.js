import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const generateTestToken = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find or use default customer user
    const customerEmail = 'customer@gmail.com';
    let user = await User.findOne({ email: customerEmail });

    if (!user) {
      console.error('❌ Customer user not found. Please run: npm run create-users');
      console.log('\nOr create a user first by registering at: POST /api/auth/register');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Generate token
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    console.log('='.repeat(80));
    console.log('🔑 BEARER TOKEN FOR POSTMAN');
    console.log('='.repeat(80));
    console.log('\n📋 User Information:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.firstName, user.lastName);
    console.log('   Role:', user.role);
    console.log('   User ID:', user._id);
    console.log('\n🔐 Bearer Token:');
    console.log('-'.repeat(80));
    console.log(token);
    console.log('-'.repeat(80));
    console.log('\n📝 How to use in Postman:');
    console.log('1. Copy the token above');
    console.log('2. In Postman, go to Authorization tab');
    console.log('3. Select "Bearer Token" from Type dropdown');
    console.log('4. Paste the token in the Token field');
    console.log('5. Click Save');
    console.log('\n✅ Token expires in 7 days');
    console.log('='.repeat(80));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error generating token:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

generateTestToken();


