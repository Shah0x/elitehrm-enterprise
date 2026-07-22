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

let cachedConnection: Promise<typeof mongoose> | null = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (!cachedConnection) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error('❌ MONGODB_URI is not defined in environment variables!');
      throw new Error('MONGODB_URI is missing');
    }

    cachedConnection = mongoose.connect(uri).then(() => mongoose);
  }

  try {
    await cachedConnection;
    console.log('[SUCCESS] Connected to MongoDB Cluster (EliteHRM Database)');
    return mongoose;
  } catch (error) {
    console.error('[ERROR] MongoDB connection error:', error);
    cachedConnection = null;
    throw error;
  }
};