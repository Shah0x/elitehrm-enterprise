import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  // Reuse existing connection if active
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('CRITICAL: MONGODB_URI environment variable is not defined.');
    throw new Error('MONGODB_URI is missing');
  }

  try {
    const db = await mongoose.connect(uri, {
      bufferCommands: false, // Prevents hanging requests on cold starts
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if DB is unreachable
    });
    isConnected = !!db.connections[0].readyState;
    console.log('[SUCCESS] Connected to MongoDB Cluster');
  } catch (error) {
    console.error('[ERROR] MongoDB connection failed:', error);
    throw error;
  }
};