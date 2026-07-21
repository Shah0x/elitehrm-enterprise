import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.ts';
import ActivityLog from '../models/ActivityLog.ts';
import { sendOnboardingEmail } from '../services/emailService.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = express.Router();

// Get all employees (Admin Only)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-passwordHash');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Add new employee (Admin Only)
router.post('/', authenticate, authorize(['admin']), async (req: any, res) => {
  const { firstName, lastName, email, password, department, designation } = req.body;
  if (!firstName || !lastName || !email || !password || !department || !designation) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newEmployee = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      role: 'employee',
      department,
      designation,
      status: 'active',
      joinDate: new Date(),
    });

    // 1. Log activity
    await ActivityLog.create({
      userId: req.user.userId,
      action: 'EMPLOYEE_ONBOARD',
      details: `Onboarded employee ${firstName} ${lastName} (${email}) under ${department}. Authorized by Shahmeer.`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || 'Unknown'
    });

    // 2. Send email notification (fails safely if SMTP is offline)
    try {
      await sendOnboardingEmail(email, `${firstName} ${lastName}`, password);
    } catch (emailErr) {
      console.error('SMTP notification bypass:', emailErr);
    }

    const result = newEmployee.toObject();
    delete (result as any).passwordHash;
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error creating employee' });
  }
});

// Get single employee
router.get('/:id', authenticate, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-passwordHash');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee' });
  }
});

export default router;
