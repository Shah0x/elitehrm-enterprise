import express from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import ActivityLog from '../models/ActivityLog.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

// Get company wide attendance stats (Admin Only)
router.get('/stats', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance stats' });
  }
});

// Get personal attendance
router.get('/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const history = await Attendance.find({ userId: req.user?.userId }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching personal attendance' });
  }
});

// Mark attendance (Check-in/out)
router.post('/mark', authenticate, async (req: AuthRequest, res) => {
  const { type, location } = req.body; // type: 'check-in' or 'check-out'
  const today = new Date();
  today.setHours(0,0,0,0);

  try {
    if (type === 'check-in') {
      const existing = await Attendance.findOne({ userId: req.user?.userId, date: { $gte: today } });
      if (existing) return res.status(400).json({ message: 'Already checked in today' });

      const checkIn = new Date();
      const status = checkIn.getHours() >= 9 ? 'late' : 'present';

      const entry = await Attendance.create({
        userId: req.user?.userId,
        date: new Date(),
        checkIn,
        status,
        location
      });

      // Log Activity
      await ActivityLog.create({
        userId: req.user?.userId,
        action: 'ATTENDANCE_CHECKIN',
        details: `Checked in successfully at ${location}. Status: ${status.toUpperCase()}.`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'Unknown'
      });

      return res.json(entry);
    } else {
      const entry = await Attendance.findOneAndUpdate(
        { userId: req.user?.userId, date: { $gte: today }, checkOut: { $exists: false } },
        { checkOut: new Date() },
        { new: true }
      );
      if (!entry) return res.status(400).json({ message: 'No active check-in found' });

      // Log Activity
      await ActivityLog.create({
        userId: req.user?.userId,
        action: 'ATTENDANCE_CHECKOUT',
        details: `Checked out successfully from ${location || 'N/A'}.`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'Unknown'
      });

      return res.json(entry);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error marking attendance' });
  }
});

export default router;
