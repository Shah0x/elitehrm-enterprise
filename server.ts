import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './src/server/routes/authRoutes.ts';
import employeeRoutes from './src/server/routes/employeeRoutes.ts';
import attendanceRoutes from './src/server/routes/attendanceRoutes.ts';
import leaveRoutes from './src/server/routes/leaveRoutes.ts';
import analyticsRoutes from './src/server/routes/analyticsRoutes.ts';
import { connectDB } from './src/server/config/db.ts';
import { seedDB } from './src/server/seed.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB
  await connectDB();
  await seedDB();

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/leaves', leaveRoutes);
  app.use('/api/analytics', analyticsRoutes);
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'EliteHRM Server is running' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`🚀 EliteHRM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
