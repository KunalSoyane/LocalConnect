const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Service = require('./models/Service');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/localconnect');
    console.log('MongoDB Connected.');

    // Clear existing data (optional, but good for a fresh seed)
    // await User.deleteMany({});
    // await Service.deleteMany({});
    // console.log('Data cleared.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    // 1. Create Providers
    const providers = [
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: hashedPassword,
        role: 'provider',
        phone: '9876543210',
        address: { street: '101 Tech Park', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
        serviceCategory: 'Plumber',
        bio: 'Expert plumber with over 10 years of experience in residential and commercial plumbing.',
        experience: 10,
        isVerified: true,
        rating: 4.8,
        totalReviews: 24
      },
      {
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        password: hashedPassword,
        role: 'provider',
        phone: '9876543211',
        address: { street: '45 Green Avenue', city: 'Bangalore', state: 'Karnataka', pincode: '560034' },
        serviceCategory: 'Home Cleaner',
        bio: 'Meticulous home cleaner specializing in deep cleaning and move-in/move-out cleaning services.',
        experience: 5,
        isVerified: true,
        rating: 4.9,
        totalReviews: 56
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        password: hashedPassword,
        role: 'provider',
        phone: '9876543212',
        address: { street: '78 Industrial Area', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        serviceCategory: 'Electrician',
        bio: 'Certified electrician for all your wiring, installation, and repair needs.',
        experience: 8,
        isVerified: true,
        rating: 4.6,
        totalReviews: 18
      }
    ];

    const createdProviders = await User.insertMany(providers);
    console.log(`Created ${createdProviders.length} providers.`);

    // 2. Create Services
    const services = [
      {
        title: 'Emergency Plumbing Repair',
        description: 'Fast and reliable emergency plumbing repairs. We handle leaks, clogs, and pipe bursts 24/7.',
        category: 'Plumber',
        price: 500,
        priceType: 'hourly',
        provider: createdProviders[0]._id,
        location: { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
        isAvailable: true,
        rating: 4.8,
        totalReviews: 12
      },
      {
        title: 'Full House Deep Cleaning',
        description: 'Comprehensive deep cleaning for your entire house, including kitchens, bathrooms, and living areas.',
        category: 'Home Cleaner',
        price: 3000,
        priceType: 'fixed',
        provider: createdProviders[1]._id,
        location: { city: 'Bangalore', state: 'Karnataka', pincode: '560034' },
        isAvailable: true,
        rating: 4.9,
        totalReviews: 30
      },
      {
        title: 'Electrical Wiring & Fault Fixing',
        description: 'Professional diagnosis and repair of electrical faults, short circuits, and complete rewiring.',
        category: 'Electrician',
        price: 400,
        priceType: 'hourly',
        provider: createdProviders[2]._id,
        location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        isAvailable: true,
        rating: 4.6,
        totalReviews: 10
      }
    ];

    const createdServices = await Service.insertMany(services);
    console.log(`Created ${createdServices.length} services.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
