const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/localconnect');

    const adminUser = {
      name: 'System Admin',
      email: 'admin@demo.com',
      password: 'demo123',
      role: 'admin',
      phone: '9999999999',
      address: { city: 'Admin City' }
    };

    // Check if exists
    const existing = await User.findOne({ email: 'admin@demo.com' });
    if (existing) {
      existing.role = 'admin';
      await existing.save();
      console.log('Admin user updated.');
    } else {
      await User.create(adminUser);
      console.log('Admin user created.');
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
