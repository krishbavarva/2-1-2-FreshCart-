import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated user role to admin');
      }
      
      // Update password
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash('123456', salt);
      await existingAdmin.save();
      console.log('✅ Password updated');
      
      await mongoose.disconnect();
      return;
    }

    // Create admin user - hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Use insertOne to bypass pre-save hooks
    await User.collection.insertOne({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      phone: '',
      address: '',
      zipCode: '',
      city: '',
      country: '',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: 123456');
    console.log('   Role: admin');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();

