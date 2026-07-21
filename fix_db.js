import { connect } from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/server/models/User.ts';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connect(process.env.MONGODB_URI);
  const salt = await bcrypt.genSalt(10);
  const empPass = await bcrypt.hash('EliteAuth_Emp_2026!', salt);
  await User.updateOne({ email: 'sarah@elitehrm.com' }, { passwordHash: empPass });
  console.log('Fixed sarah password');
  process.exit(0);
}
run();
