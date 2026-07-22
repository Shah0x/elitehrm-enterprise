import bcrypt from 'bcryptjs';
import Attendance from './models/Attendance';
import Leave from './models/Leave';
import User from './models/User';

export const seedDB = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 100) {
      console.log('[SUCCESS] Database already seeded with realistic data. Skipping...');
      return;
    }

    console.log('[INIT] Starting Professional Seeding...');
    
    // Clear existing to ensure clean seed
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('EliteAuth_Admin_2026!', salt);
    const empPass = await bcrypt.hash('EliteAuth_Emp_2026!', salt);

    // 1. Create Admin
    const admin = await User.create({
      firstName: 'Shahmeer',
      lastName: 'Architect',
      email: 'admin@elitehrm.com',
      passwordHash: pass,
      role: 'admin',
      department: 'Management',
      designation: 'C-Level Architect',
      status: 'active'
    });

    // 2. Create Employees
    const employeesData = [
      { f: 'Sarah', l: 'Parker', d: 'Engineering', des: 'Senior MERN Engineer', status: 'remote' },
      { f: 'Michael', l: 'Ross', d: 'Sales', des: 'VP Sales', status: 'active' },
      { f: 'Donna', l: 'Paulsen', d: 'HR', des: 'Lead HR Generalist', status: 'active' },
      { f: 'Louis', l: 'Litt', d: 'Finance', des: 'Managing Director', status: 'active' },
      { f: 'Rachel', l: 'Zane', d: 'Design', des: 'Lead Designer', status: 'on_leave' },
      { f: 'Harvey', l: 'Specter', d: 'Product', des: 'Product Visionary', status: 'remote' },
      { f: 'Tom', l: 'Hanks', d: 'Engineering', des: 'DevOps Lead', status: 'active' },
      { f: 'Emma', l: 'Watson', d: 'Marketing', des: 'Growth Lead', status: 'active' },
      { f: 'Robert', l: 'Downey', d: 'Engineering', des: 'Senior Developer', status: 'remote' },
      { f: 'Scarlett', l: 'Johansson', d: 'Product', des: 'Principal PM', status: 'active' },
    ];

    const employees = [];
    for (const e of employeesData) {
      const emp = await User.create({
        firstName: e.f,
        lastName: e.l,
        email: `${e.f.toLowerCase()}@elitehrm.com`,
        passwordHash: empPass,
        role: 'employee',
        department: e.d,
        designation: e.des,
        status: e.status || 'active',
        joinDate: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365))
      });
      employees.push(emp);
    }

    // 3. Seed Attendance History (Last 30 days)
    console.log('[DATA] Generating Attendance Trends...');
    const now = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends

        for (const emp of [...employees, admin]) {
            const checkInTime = new Date(date);
            checkInTime.setHours(8, Math.floor(Math.random() * 60), 0);
            
            const checkOutTime = new Date(date);
            checkOutTime.setHours(17, Math.floor(Math.random() * 60), 0);

            const late = checkInTime.getHours() >= 9;

            await Attendance.create({
                userId: emp._id,
                date,
                checkIn: checkInTime,
                checkOut: checkOutTime,
                status: late ? 'late' : 'present',
                location: 'San Francisco Office (HQ)'
            });
        }
    }

    // 4. Seed Leave Requests
    console.log('[LOG] Generating Leave Requests...');
    const leaveTypes = ['sick', 'casual', 'vacation', 'other'];
    const statuses = ['approved', 'rejected', 'pending'];

    for (const emp of employees.slice(0, 5)) {
        const startDate = new Date();
        startDate.setDate(now.getDate() + Math.floor(Math.random() * 10));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 3);

        await Leave.create({
            userId: emp._id,
            leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
            startDate,
            endDate,
            reason: 'Attending family function and mandatory rest.',
            status: statuses[Math.floor(Math.random() * statuses.length)],
            approvedBy: admin._id
        });
    }

    console.log('[READY] Seeding Complete! Elite Ecosystem Ready.');
  } catch (error) {
    console.error('[ERROR] Seeding failed:', error);
  }
};
