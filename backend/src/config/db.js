import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Enhanced connection options
    const options = {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    };

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/leo-portal';
    
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 URI:', mongoUri.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials in logs
    
    await mongoose.connect(mongoUri, options);
    
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Make sure MongoDB is running on your system');
    console.error('💡 You can start MongoDB with: mongod --dbpath /path/to/your/db');
    process.exit(1);
  }
};