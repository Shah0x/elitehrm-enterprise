import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './src/server/config/db';
import analyticsRoutes from './src/server/routes/analyticsRoutes';
import attendanceRoutes from './src/server/routes/attendanceRoutes';
import authRoutes from './src/server/routes/authRoutes';
import employeeRoutes from './src/server/routes/employeeRoutes';
import leaveRoutes from './src/server/routes/leaveRoutes';
import { seedDB } from './src/server/seed';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Unconditional DB connection middleware for Vercel Serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    return res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use(express.json());
app.use(cookieParser());

// 2. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EliteHRM Server is running' });
});

// 3. Local Development runner (Ignored by Vercel)
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;

  async function startLocal() {
    await connectDB();
    await seedDB();

    if (process.env.NODE_ENV !== 'production') {
      // Dynamic import prevents Vite from being bundled into Vercel serverless function
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 EliteHRM Server running locally on http://localhost:${PORT}`);
    });
  }

  startLocal();
}

export default app;