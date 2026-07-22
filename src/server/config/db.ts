// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI;

// export const connectDB = async () => {
//   if (!MONGODB_URI) {
//     console.warn('⚠️ MONGODB_URI not found. Server will run in mock mode for development.');
//     return;
//   }

//   try {
//     await mongoose.connect(MONGODB_URI);
//     console.log('[SUCCESS] Connected to MongoDB Cluster (EliteHRM Database)');
//   } catch (error) {
//     console.error('[ERROR] MongoDB connection error:', error);
//     process.exit(1);
//   }
// };


import mongoose from 'mongoose';

export const connectDB = async () => {
  // 1. If already connected, reuse the active connection
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // 2. Dynamically fetch the URI inside the function execution
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables!');
    throw new Error('MONGODB_URI is missing');
  }

  try {
    // 3. Connect to MongoDB Atlas
    await mongoose.connect(uri);
    console.log('[SUCCESS] Connected to MongoDB Cluster (EliteHRM Database)');
  } catch (error) {
    console.error('[ERROR] MongoDB connection error:', error);
    // 4. Do NOT call process.exit(1) in serverless!
    throw error;
  }
};