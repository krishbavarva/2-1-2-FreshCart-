import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const createUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Create Customer User
    const customerEmail = 'customer@gmail.com';
    const customerPassword = '123456';
    
    let existingCustomer = await User.findOne({ email: customerEmail });
    if (existingCustomer) {
      console.log('⚠️  Customer user already exists');
      console.log('   Email:', existingCustomer.email);
      console.log('   Role:', existingCustomer.role);
      
      // Update role to customer if not already
      if (existingCustomer.role !== 'customer') {
        existingCustomer.role = 'customer';
        await existingCustomer.save();
        console.log('✅ Updated user role to customer');
      }
      
      // Update password
      const salt1 = await bcrypt.genSalt(10);
      existingCustomer.password = await bcrypt.hash(customerPassword, salt1);
      await existingCustomer.save();
      console.log('✅ Password updated for customer\n');
    } else {
      // Create customer user
      const salt1 = await bcrypt.genSalt(10);
      const hashedCustomerPassword = await bcrypt.hash(customerPassword, salt1);

      await User.collection.insertOne({
        firstName: 'John',
        lastName: 'Customer',
        email: customerEmail,
        password: hashedCustomerPassword,
        role: 'customer',
        phone: '1234567890',
        address: '123 Main Street',
        zipCode: '12345',
        city: 'New York',
        country: 'USA',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Customer user created successfully!');
      console.log('   Email:', customerEmail);
      console.log('   Password:', customerPassword);
      console.log('   Role: customer\n');
    }

    // Create Employee User
    const employeeEmail = 'employee@gmail.com';
    const employeePassword = '123456';
    
    let existingEmployee = await User.findOne({ email: employeeEmail });
    if (existingEmployee) {
      console.log('⚠️  Employee user already exists');
      console.log('   Email:', existingEmployee.email);
      console.log('   Role:', existingEmployee.role);
      
      // Update role to rider if not already
      if (existingEmployee.role !== 'rider') {
        existingEmployee.role = 'rider';
        await existingEmployee.save();
        console.log('✅ Updated user role to rider');
      }
      
      // Update password
      const salt2 = await bcrypt.genSalt(10);
      existingEmployee.password = await bcrypt.hash(employeePassword, salt2);
      await existingEmployee.save();
      console.log('✅ Password updated for employee\n');
    } else {
      // Create employee user
      const salt2 = await bcrypt.genSalt(10);
      const hashedEmployeePassword = await bcrypt.hash(employeePassword, salt2);

      await User.collection.insertOne({
        firstName: 'Jane',
        lastName: 'Employee',
        email: employeeEmail,
        password: hashedEmployeePassword,
        role: 'rider',
        phone: '0987654321',
        address: '456 Work Avenue',
        zipCode: '54321',
        city: 'Los Angeles',
        country: 'USA',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Employee user created successfully!');
      console.log('   Email:', employeeEmail);
      console.log('   Password:', employeePassword);
      console.log('   Role: rider\n');
    }

    console.log('📋 Summary:');
    console.log('   Customer: customer@gmail.com / 123456');
    console.log('   Rider: employee@gmail.com / 123456');
    console.log('\n✅ All users created/updated successfully!');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createUsers();


