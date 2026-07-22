import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ActivityLog from '../models/ActivityLog';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'elite-hrm-secret-key-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'elite-hrm-refresh-secret-key-2026';

// Helper to sign access token (15m expiration)
const generateAccessToken = (userId: string, role: string, email: string) => {
  return jwt.sign(
    { userId, role, email },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Helper to sign refresh token (7d expiration)
const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Find user
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate access and refresh tokens
    const accessToken = generateAccessToken(user._id.toString(), user.role, user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    // 4. Save refresh token in the database
    try {
      user.refreshToken = refreshToken;
      await user.save();
    } catch (saveError) {
      console.error('Warning: Failed to save refresh token to DB due to permissions:', saveError);
      // We continue with login so the user isn't completely blocked, but they might not be able to refresh their session later
    }

    // 5. Audit log
    try {
      await ActivityLog.create({
        userId: user._id,
        action: 'LOGIN',
        details: `Successful sign-in. Authorized by Shahmeer Security framework.`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'Unknown'
      });
    } catch (auditError) {
      console.error('Warning: Failed to create audit log due to DB permissions:', auditError);
    }

    // 6. Set Cookies
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        orgId: user.orgId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: any, res: Response) => {
  try {
    const token = req.cookies.token;
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (e) {
        // Token might be expired, check refresh token
      }
    }

    if (!userId && req.cookies.refreshToken) {
      try {
        const decoded = jwt.verify(req.cookies.refreshToken, JWT_REFRESH_SECRET) as any;
        userId = decoded.userId;
      } catch (e) {}
    }

    if (userId) {
      // Clear refresh token in database
      try {
        await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
      } catch (e) {
        console.error('Warning: Failed to unset refresh token:', e);
      }
      
      // Audit log
      try {
        await ActivityLog.create({
          userId,
          action: 'LOGOUT',
          details: `Secure user sign-out and session destruction.`,
          ipAddress: req.ip,
          userAgent: req.get('user-agent') || 'Unknown'
        });
      } catch (e) {
        console.error('Warning: Failed to log logout activity:', e);
      }
    }

    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const me = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Handle explicit token refresh rotation
export const refresh = async (req: Request, res: Response) => {
  const clientRefreshToken = req.cookies.refreshToken;

  if (!clientRefreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    // 1. Verify Refresh Token
    const decoded = jwt.verify(clientRefreshToken, JWT_REFRESH_SECRET) as any;
    
    // 2. Find user in Database
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== clientRefreshToken) {
      // Refresh token might have been rotated or compromised
      return res.status(401).json({ message: 'Invalid or revoked session' });
    }

    // 3. Generate new Access and Refresh Tokens (Token Rotation)
    const newAccessToken = generateAccessToken(user._id.toString(), user.role, user.email);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    // 4. Update stored refresh token
    try {
      user.refreshToken = newRefreshToken;
      await user.save();
    } catch (e) {
      console.error('Warning: Failed to update refresh token:', e);
    }

    // 5. Update Cookies
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

    res.json({
      message: 'Tokens refreshed successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        orgId: user.orgId
      }
    });
  } catch (error) {
    console.error('Session refresh rotation error:', error);
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return res.status(401).json({ message: 'Session expired or invalid' });
  }
};
