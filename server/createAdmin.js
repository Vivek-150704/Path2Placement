// server/createAdmin.js
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for admin creation.');

    // Check if an admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    // Create a new admin
    const newAdmin = new Admin({
      username: 'admin',
      password: 'password123', // Choose a simple password for now
    });

    await newAdmin.save();
    console.log('Admin user created successfully!');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

createAdmin();