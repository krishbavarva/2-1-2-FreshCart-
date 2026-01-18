import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migrate all employee users to rider
const migrateEmployeeToRider = async () => {
  try {
    await connectDB();
    
    console.log('\n🔄 Starting migration: employee → rider');
    
    // Find all users with 'employee' role
    const employees = await User.find({ role: 'employee' });
    
    if (employees.length === 0) {
      console.log('✅ No users with "employee" role found. Migration not needed.');
      process.exit(0);
    }
    
    console.log(`📋 Found ${employees.length} user(s) with "employee" role`);
    
    // Update all employees to riders
    const result = await User.updateMany(
      { role: 'employee' },
      { $set: { role: 'rider' } }
    );
    
    console.log(`✅ Successfully migrated ${result.modifiedCount} user(s) from "employee" to "rider" role`);
    
    // List migrated users
    const migratedUsers = await User.find({ role: 'rider' });
    console.log('\n📋 Migrated users:');
    migratedUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.firstName} ${user.lastName})`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

// Run migration
migrateEmployeeToRider();

