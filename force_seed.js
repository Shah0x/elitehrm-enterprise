import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedDB } from './src/server/seed.ts';
import User from './src/server/models/User.ts';

dotenv.config({ path: '.env.example' }); // We'll just read process.env.MONGODB_URI
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elitehrm').then(async () => {
    console.log('Connected to DB. Forcing seed...');
    await User.deleteMany({}); // Drop to force re-seed
    await seedDB();
    console.log('Done.');
    process.exit(0);
}).catch(console.error);
