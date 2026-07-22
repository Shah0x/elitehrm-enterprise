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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse body & cookies before route handling
app.use(express.json());
app.use(cookieParser());

// 1. Database Connection Middleware (Per-request execution with connection reuse)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    return res.status(500).json({ error: 'Database connection failed' });
  }
});

// 2. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EliteHRM Server is running' });
});

// Global Error Handling Middleware (Returns JSON instead of crashing Vercel function)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
});

// 3. Local Development runner (Guarded & ignored by Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;

  async function startLocal() {
    await connectDB();

    // Dynamically import seedDB so seeding code is never bundled on Vercel
    const { seedDB } = await import('./src/server/seed');
    await seedDB();

    if (process.env.NODE_ENV !== 'production') {
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