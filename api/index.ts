import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from '../src/server/config/db';
import analyticsRoutes from '../src/server/routes/analyticsRoutes';
import attendanceRoutes from '../src/server/routes/attendanceRoutes';
import authRoutes from '../src/server/routes/authRoutes';
import employeeRoutes from '../src/server/routes/employeeRoutes';
import leaveRoutes from '../src/server/routes/leaveRoutes';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// Database connection per serverless invocation
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    return res.status(500).json({ error: 'Database connection failed' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EliteHRM Server is running on Vercel' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
});

export default app;