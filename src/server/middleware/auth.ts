import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'elite-hrm-secret-key-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'elite-hrm-refresh-secret-key-2026';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: 'admin' | 'employee';
    email: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  // Case 1: Active Access Token exists
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      return next();
    } catch (err: any) {
      // If token is invalid for reasons other than expiration, clear cookies and reject
      if (err.name !== 'TokenExpiredError') {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        return res.status(401).json({ message: 'Invalid token session' });
      }
      // If it is expired, fall through to attempt Refresh Token auto-renew
    }
  }

  // Case 2: Attempt auto-refresh if refreshToken exists
  if (refreshToken) {
    try {
      // Verify the refresh token
      const decodedRefresh = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
      
      // Look up user and check if the stored token matches
      const user = await User.findById(decodedRefresh.userId);
      if (user && user.refreshToken === refreshToken) {
        // Generate new Access Token (15m) and Refresh Token (7d rotation)
        const newAccessToken = jwt.sign(
          { userId: user._id.toString(), role: user.role, email: user.email },
          JWT_SECRET,
          { expiresIn: '15m' }
        );
        const newRefreshToken = jwt.sign(
          { userId: user._id.toString() },
          JWT_REFRESH_SECRET,
          { expiresIn: '7d' }
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        // Update Cookies
        res.cookie('token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Set req.user and proceed
        req.user = {
          userId: user._id.toString(),
          role: user.role as 'admin' | 'employee',
          email: user.email
        };
        return next();
      }
    } catch (refreshErr) {
      console.error('Auto-refresh failure inside middleware:', refreshErr);
    }
  }

  // Case 3: No valid credentials could be established
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  return res.status(401).json({ message: 'Authentication required or session expired' });
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};
