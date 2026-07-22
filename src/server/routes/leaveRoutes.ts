import express from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import ActivityLog from '../models/ActivityLog.js';
import Leave from '../models/Leave.js';
import { sendLeaveStatusEmail } from '../services/emailService.js';

const router = express.Router();

// Get all leave requests (Admin only)
router.get('/all', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const leaves = await Leave.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests' });
  }
});

// Get personal leave history
router.get('/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const history = await Leave.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave history' });
  }
});

// Create leave request
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const leave = await Leave.create({
      ...req.body,
      userId: req.user?.userId,
      status: 'pending'
    });

    // Log Activity
    await ActivityLog.create({
      userId: req.user?.userId,
      action: 'LEAVE_SUBMIT',
      details: `Submitted leave request for ${req.body.leaveType} (${req.body.startDate} to ${req.body.endDate}).`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || 'Unknown'
    });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting leave request' });
  }
});

// Approve/Reject leave (Admin only)
router.patch('/:id/status', authenticate, authorize(['admin']), async (req: AuthRequest, res) => {
  const { status } = req.body;
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user?.userId },
      { new: true }
    ).populate('userId', 'firstName lastName email');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Log Activity
    await ActivityLog.create({
      userId: req.user?.userId,
      action: 'LEAVE_ACTION',
      details: `Actioned leave request ID ${leave._id} with status ${status.toUpperCase()}.`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || 'Unknown'
    });

    // Send status update email if the user exists and has an email
    const employee = leave.userId as any;
    if (employee && employee.email) {
      const duration = `${new Date(leave.startDate).toDateString()} to ${new Date(leave.endDate).toDateString()}`;
      try {
        await sendLeaveStatusEmail(
          employee.email,
          `${employee.firstName} ${employee.lastName}`,
          leave.leaveType,
          status,
          duration
        );
      } catch (emailErr) {
        console.error('SMTP leave notify bypass:', emailErr);
      }
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Error updating leave status' });
  }
});

export default router;
