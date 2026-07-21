import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDB = async () => {
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not found. Server will run in mock mode for development.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[SUCCESS] Connected to MongoDB Cluster (EliteHRM Database)');
  } catch (error) {
    console.error('[ERROR] MongoDB connection error:', error);
    process.exit(1);
  }
};
