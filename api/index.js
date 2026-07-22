// api/index.ts
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express5 from "express";

// src/server/config/db.ts
import mongoose from "mongoose";
var isConnected = false;
var connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("CRITICAL: MONGODB_URI environment variable is not defined.");
    throw new Error("MONGODB_URI is missing");
  }
  try {
    const db = await mongoose.connect(uri, {
      bufferCommands: false,
      // Prevents hanging requests on cold starts
      serverSelectionTimeoutMS: 5e3
      // Timeout after 5s if DB is unreachable
    });
    isConnected = !!db.connections[0].readyState;
    console.log("[SUCCESS] Connected to MongoDB Cluster");
  } catch (error) {
    console.error("[ERROR] MongoDB connection failed:", error);
    throw error;
  }
};

// src/server/routes/analyticsRoutes.ts
import { GoogleGenAI, Type } from "@google/genai";
import express from "express";

// src/server/middleware/auth.ts
import jwt from "jsonwebtoken";

// src/server/models/User.ts
import mongoose2, { Schema } from "mongoose";
var UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "employee"], default: "employee" },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "inactive", "remote", "on_leave"], default: "active" },
  orgId: { type: Schema.Types.ObjectId, ref: "Org" },
  refreshToken: { type: String }
}, { timestamps: true });
var User_default = mongoose2.models.User || mongoose2.model("User", UserSchema);

// src/server/middleware/auth.ts
var JWT_SECRET = process.env.JWT_SECRET || "elite-hrm-secret-key-2024";
var JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "elite-hrm-refresh-secret-key-2026";
var authenticate = async (req, res, next) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      if (err.name !== "TokenExpiredError") {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        return res.status(401).json({ message: "Invalid token session" });
      }
    }
  }
  if (refreshToken) {
    try {
      const decodedRefresh = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const user = await User_default.findById(decodedRefresh.userId);
      if (user && user.refreshToken === refreshToken) {
        const newAccessToken = jwt.sign(
          { userId: user._id.toString(), role: user.role, email: user.email },
          JWT_SECRET,
          { expiresIn: "15m" }
        );
        const newRefreshToken = jwt.sign(
          { userId: user._id.toString() },
          JWT_REFRESH_SECRET,
          { expiresIn: "7d" }
        );
        user.refreshToken = newRefreshToken;
        await user.save();
        res.cookie("token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1e3
          // 15 minutes
        });
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1e3
          // 7 days
        });
        req.user = {
          userId: user._id.toString(),
          role: user.role,
          email: user.email
        };
        return next();
      }
    } catch (refreshErr) {
      console.error("Auto-refresh failure inside middleware:", refreshErr);
    }
  }
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  return res.status(401).json({ message: "Authentication required or session expired" });
};
var authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

// src/server/models/Attendance.ts
import mongoose3, { Schema as Schema2 } from "mongoose";
var AttendanceSchema = new Schema2({
  userId: { type: Schema2.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  status: { type: String, enum: ["present", "absent", "late", "half-day"], default: "present" },
  location: { type: String }
}, { timestamps: true });
var Attendance_default = mongoose3.models.Attendance || mongoose3.model("Attendance", AttendanceSchema);

// src/server/models/Leave.ts
import mongoose4, { Schema as Schema3 } from "mongoose";
var LeaveSchema = new Schema3({
  userId: { type: Schema3.Types.ObjectId, ref: "User", required: true },
  leaveType: { type: String, enum: ["sick", "casual", "vacation", "other"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  approvedBy: { type: Schema3.Types.ObjectId, ref: "User" }
}, { timestamps: true });
var Leave_default = mongoose4.models.Leave || mongoose4.model("Leave", LeaveSchema);

// src/server/routes/analyticsRoutes.ts
var router = express.Router();
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
router.get("/insights", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const recentAttendance = await Attendance_default.find().populate("userId", "firstName lastName department").sort({ date: -1 }).limit(50);
    const recentLeaves = await Leave_default.find().populate("userId", "firstName lastName department").sort({ createdAt: -1 }).limit(30);
    const attendanceSummary = recentAttendance.map((a) => ({
      employeeName: a.userId ? `${a.userId.firstName} ${a.userId.lastName}` : "Unknown",
      department: a.userId ? a.userId.department : "Unknown",
      date: a.date.toDateString(),
      status: a.status,
      checkIn: a.checkIn ? a.checkIn.toLocaleTimeString() : "N/A",
      checkOut: a.checkOut ? a.checkOut.toLocaleTimeString() : "N/A"
    }));
    const leaveSummary = recentLeaves.map((l) => ({
      employeeName: l.userId ? `${l.userId.firstName} ${l.userId.lastName}` : "Unknown",
      department: l.userId ? l.userId.department : "Unknown",
      leaveType: l.leaveType,
      duration: `${l.startDate.toDateString()} to ${l.endDate.toDateString()}`,
      status: l.status,
      reason: l.reason
    }));
    const prompt = `You are an elite, executive-level Chief Human Resources Officer (CHRO). Analyze the following real-time company workforce datasets and provide 3 high-impact, strategic, and professional insights or recommendations.
    
    ATTENDANCE DATASET (Last 50 Records):
    ${JSON.stringify(attendanceSummary, null, 2)}
    
    LEAVE REQUESTS DATASET (Last 30 Records):
    ${JSON.stringify(leaveSummary, null, 2)}
    
    Provide 3 distinct strategic items. Each item must have:
    - title: Short, professional title (e.g., "Punctuality Correction" or "Overtime Risk Detected").
    - insight: A detailed, highly sophisticated analysis of the trend with a proactive strategic recommendation.
    - tag: One-word category tag (e.g., "Burnout", "Efficiency", "Scheduling", "Compliance").`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a Fortune 500 Chief Human Resources Officer. Write formal, high-value executive-level findings in structured JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Actionable, professional title." },
              insight: { type: Type.STRING, description: "Detailed strategic insight with analytical recommendation." },
              tag: { type: Type.STRING, description: "A single category word like Burnout, Efficiency, Scheduling, Planning." }
            },
            required: ["title", "insight", "tag"]
          }
        }
      }
    });
    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty response from Gemini API");
    }
    const insights = JSON.parse(rawText);
    res.json({ insights });
  } catch (error) {
    console.error("Gemini AI Insight Error:", error);
    res.status(500).json({
      message: "Failed to generate strategic insights via Gemini AI.",
      error: error.message
    });
  }
});
var analyticsRoutes_default = router;

// src/server/routes/attendanceRoutes.ts
import express2 from "express";

// src/server/models/ActivityLog.ts
import mongoose5, { Schema as Schema4 } from "mongoose";
var ActivityLogSchema = new Schema4({
  userId: { type: Schema4.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  details: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now, required: true }
});
var ActivityLog_default = mongoose5.models.ActivityLog || mongoose5.model("ActivityLog", ActivityLogSchema);

// src/server/routes/attendanceRoutes.ts
var router2 = express2.Router();
router2.get("/stats", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const stats = await Attendance_default.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance stats" });
  }
});
router2.get("/my", authenticate, async (req, res) => {
  try {
    const history = await Attendance_default.find({ userId: req.user?.userId }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching personal attendance" });
  }
});
router2.post("/mark", authenticate, async (req, res) => {
  const { type, location } = req.body;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  try {
    if (type === "check-in") {
      const existing = await Attendance_default.findOne({ userId: req.user?.userId, date: { $gte: today } });
      if (existing) return res.status(400).json({ message: "Already checked in today" });
      const checkIn = /* @__PURE__ */ new Date();
      const status = checkIn.getHours() >= 9 ? "late" : "present";
      const entry = await Attendance_default.create({
        userId: req.user?.userId,
        date: /* @__PURE__ */ new Date(),
        checkIn,
        status,
        location
      });
      await ActivityLog_default.create({
        userId: req.user?.userId,
        action: "ATTENDANCE_CHECKIN",
        details: `Checked in successfully at ${location}. Status: ${status.toUpperCase()}.`,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || "Unknown"
      });
      return res.json(entry);
    } else {
      const entry = await Attendance_default.findOneAndUpdate(
        { userId: req.user?.userId, date: { $gte: today }, checkOut: { $exists: false } },
        { checkOut: /* @__PURE__ */ new Date() },
        { new: true }
      );
      if (!entry) return res.status(400).json({ message: "No active check-in found" });
      await ActivityLog_default.create({
        userId: req.user?.userId,
        action: "ATTENDANCE_CHECKOUT",
        details: `Checked out successfully from ${location || "N/A"}.`,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || "Unknown"
      });
      return res.json(entry);
    }
  } catch (error) {
    res.status(500).json({ message: "Error marking attendance" });
  }
});
var attendanceRoutes_default = router2;

// src/server/routes/authRoutes.ts
import { Router } from "express";

// src/server/controllers/authController.ts
import bcrypt from "bcryptjs";
import jwt2 from "jsonwebtoken";
var JWT_SECRET2 = process.env.JWT_SECRET || "elite-hrm-secret-key-2024";
var JWT_REFRESH_SECRET2 = process.env.JWT_REFRESH_SECRET || "elite-hrm-refresh-secret-key-2026";
var generateAccessToken = (userId, role, email) => {
  return jwt2.sign(
    { userId, role, email },
    JWT_SECRET2,
    { expiresIn: "15m" }
  );
};
var generateRefreshToken = (userId) => {
  return jwt2.sign(
    { userId },
    JWT_REFRESH_SECRET2,
    { expiresIn: "7d" }
  );
};
var login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User_default.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const accessToken = generateAccessToken(user._id.toString(), user.role, user.email);
    const refreshToken = generateRefreshToken(user._id.toString());
    try {
      user.refreshToken = refreshToken;
      await user.save();
    } catch (saveError) {
      console.error("Warning: Failed to save refresh token to DB due to permissions:", saveError);
    }
    try {
      await ActivityLog_default.create({
        userId: user._id,
        action: "LOGIN",
        details: `Successful sign-in. Authorized by Shahmeer Security framework.`,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || "Unknown"
      });
    } catch (auditError) {
      console.error("Warning: Failed to create audit log due to DB permissions:", auditError);
    }
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1e3
      // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    res.json({
      message: "Login successful",
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
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    let userId = null;
    if (token) {
      try {
        const decoded = jwt2.verify(token, JWT_SECRET2);
        userId = decoded.userId;
      } catch (e) {
      }
    }
    if (!userId && req.cookies.refreshToken) {
      try {
        const decoded = jwt2.verify(req.cookies.refreshToken, JWT_REFRESH_SECRET2);
        userId = decoded.userId;
      } catch (e) {
      }
    }
    if (userId) {
      try {
        await User_default.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
      } catch (e) {
        console.error("Warning: Failed to unset refresh token:", e);
      }
      try {
        await ActivityLog_default.create({
          userId,
          action: "LOGOUT",
          details: `Secure user sign-out and session destruction.`,
          ipAddress: req.ip,
          userAgent: req.get("user-agent") || "Unknown"
        });
      } catch (e) {
        console.error("Warning: Failed to log logout activity:", e);
      }
    }
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var me = async (req, res) => {
  try {
    const user = await User_default.findById(req.user.userId).select("-passwordHash -refreshToken");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
var refresh = async (req, res) => {
  const clientRefreshToken = req.cookies.refreshToken;
  if (!clientRefreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }
  try {
    const decoded = jwt2.verify(clientRefreshToken, JWT_REFRESH_SECRET2);
    const user = await User_default.findById(decoded.userId);
    if (!user || user.refreshToken !== clientRefreshToken) {
      return res.status(401).json({ message: "Invalid or revoked session" });
    }
    const newAccessToken = generateAccessToken(user._id.toString(), user.role, user.email);
    const newRefreshToken = generateRefreshToken(user._id.toString());
    try {
      user.refreshToken = newRefreshToken;
      await user.save();
    } catch (e) {
      console.error("Warning: Failed to update refresh token:", e);
    }
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1e3
      // 15 minutes
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    res.json({
      message: "Tokens refreshed successfully",
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
    console.error("Session refresh rotation error:", error);
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return res.status(401).json({ message: "Session expired or invalid" });
  }
};

// src/server/routes/authRoutes.ts
var router3 = Router();
router3.post("/login", login);
router3.post("/logout", logout);
router3.post("/refresh", refresh);
router3.get("/me", authenticate, me);
var authRoutes_default = router3;

// src/server/routes/employeeRoutes.ts
import bcrypt2 from "bcryptjs";
import express3 from "express";

// src/server/services/emailService.ts
import nodemailer from "nodemailer";
var transporter = null;
async function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    console.log("\u{1F4EC} Initializing production SMTP transporter...");
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      // true for 465, false for other ports
      auth: { user, pass }
    });
  } else {
    console.log("\u{1F4EC} SMTP configuration missing. Initializing local console-logger email fallback...");
    transporter = nodemailer.createTransport({
      jsonTransport: true
      // prints output as JSON structure
    });
  }
  return transporter;
}
async function sendEmail({
  to,
  subject,
  text,
  html
}) {
  try {
    const client = await getTransporter();
    const fromName = "EliteHRM Alerts";
    const fromEmail = process.env.SMTP_FROM || "alerts@elitehrm.com";
    const info = await client.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, "<br>")
    });
    console.log(`\u2709\uFE0F Email dispatched to ${to} | Subject: "${subject}"`);
    if (process.env.SMTP_HOST === void 0) {
      console.log("[LOG] Email content (dev log):", info.message);
    }
    return info;
  } catch (error) {
    console.error("[ERROR] Nodemailer dispatch error:", error);
    return null;
  }
}
async function sendOnboardingEmail(userEmail, userName, passwordText) {
  const subject = "Welcome to EliteHRM - Account Provisioned";
  const text = `Hello ${userName},

Your professional profile has been securely provisioned on EliteHRM by Shahmeer Akram.

Access Details:
- Workspace Portal: EliteHRM Enterprise
- Your Username: ${userEmail}
- Auto-Generated Password: ${passwordText}

Please sign in immediately and update your credentials under settings.

Best Regards,
The EliteHRM Provisioning Team
Owner: Shahmeer`;
  const html = `
    <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #4f46e5; margin-bottom: 16px;">Welcome to EliteHRM Enterprise</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Your professional profile has been securely provisioned on EliteHRM by <strong>Shahmeer Akram</strong>.</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Access Credentials:</strong></p>
        <p style="margin: 0 0 4px 0;">\u{1F4E7} Email: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${userEmail}</code></p>
        <p style="margin: 0;">\u{1F511} Password: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${passwordText}</code></p>
      </div>
      <p>Please sign in immediately and update your credentials under administrative settings.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #64748b;">This notification is automated. Owner: Shahmeer | Crafted by Shahmeer Akram</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject, text, html });
}
async function sendLeaveStatusEmail(userEmail, userName, leaveType, status, duration) {
  const subject = `Leave Request Actioned - ${status.toUpperCase()}`;
  const text = `Hello ${userName},

Your request for ${leaveType} leave for the duration of ${duration} has been updated to: ${status.toUpperCase()}.

Please log in to your dashboard to view complete comments.

Sincerely,
EliteHRM HR Operations`;
  const html = `
    <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; rounded: 12px;">
      <h3 style="color: ${status === "approved" ? "#16a34a" : "#dc2626"};">Leave Request Status Updated</h3>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Your request for <strong>${leaveType}</strong> leave has been actioned.</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0;">\u{1F5D3}\uFE0F Duration: ${duration}</p>
        <p style="margin: 0;">Status: <strong style="color: ${status === "approved" ? "#16a34a" : "#dc2626"}">${status.toUpperCase()}</strong></p>
      </div>
      <p>Please log in to your dashboard to view complete details.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #64748b;">EliteHRM Platform | Owner: Shahmeer</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject, text, html });
}

// src/server/routes/employeeRoutes.ts
var router4 = express3.Router();
router4.get("/", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const employees = await User_default.find({ role: "employee" }).select("-passwordHash");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees" });
  }
});
router4.post("/", authenticate, authorize(["admin"]), async (req, res) => {
  const { firstName, lastName, email, password, department, designation } = req.body;
  if (!firstName || !lastName || !email || !password || !department || !designation) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const existingUser = await User_default.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Employee with this email already exists" });
    }
    const salt = await bcrypt2.genSalt(10);
    const passwordHash = await bcrypt2.hash(password, salt);
    const newEmployee = await User_default.create({
      firstName,
      lastName,
      email,
      passwordHash,
      role: "employee",
      department,
      designation,
      status: "active",
      joinDate: /* @__PURE__ */ new Date()
    });
    await ActivityLog_default.create({
      userId: req.user.userId,
      action: "EMPLOYEE_ONBOARD",
      details: `Onboarded employee ${firstName} ${lastName} (${email}) under ${department}. Authorized by Shahmeer.`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "Unknown"
    });
    try {
      await sendOnboardingEmail(email, `${firstName} ${lastName}`, password);
    } catch (emailErr) {
      console.error("SMTP notification bypass:", emailErr);
    }
    const result = newEmployee.toObject();
    delete result.passwordHash;
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating employee" });
  }
});
router4.get("/:id", authenticate, async (req, res) => {
  try {
    const employee = await User_default.findById(req.params.id).select("-passwordHash");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee" });
  }
});
var employeeRoutes_default = router4;

// src/server/routes/leaveRoutes.ts
import express4 from "express";
var router5 = express4.Router();
router5.get("/all", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const leaves = await Leave_default.find().populate("userId", "firstName lastName email").sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave requests" });
  }
});
router5.get("/my", authenticate, async (req, res) => {
  try {
    const history = await Leave_default.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave history" });
  }
});
router5.post("/", authenticate, async (req, res) => {
  try {
    const leave = await Leave_default.create({
      ...req.body,
      userId: req.user?.userId,
      status: "pending"
    });
    await ActivityLog_default.create({
      userId: req.user?.userId,
      action: "LEAVE_SUBMIT",
      details: `Submitted leave request for ${req.body.leaveType} (${req.body.startDate} to ${req.body.endDate}).`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "Unknown"
    });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: "Error submitting leave request" });
  }
});
router5.patch("/:id/status", authenticate, authorize(["admin"]), async (req, res) => {
  const { status } = req.body;
  try {
    const leave = await Leave_default.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user?.userId },
      { new: true }
    ).populate("userId", "firstName lastName email");
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    await ActivityLog_default.create({
      userId: req.user?.userId,
      action: "LEAVE_ACTION",
      details: `Actioned leave request ID ${leave._id} with status ${status.toUpperCase()}.`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "Unknown"
    });
    const employee = leave.userId;
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
        console.error("SMTP leave notify bypass:", emailErr);
      }
    }
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: "Error updating leave status" });
  }
});
var leaveRoutes_default = router5;

// api/index.ts
dotenv.config();
var app = express5();
app.use(express5.json());
app.use(cookieParser());
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
});
app.use("/api/auth", authRoutes_default);
app.use("/api/employees", employeeRoutes_default);
app.use("/api/attendance", attendanceRoutes_default);
app.use("/api/leaves", leaveRoutes_default);
app.use("/api/analytics", analyticsRoutes_default);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "EliteHRM Server is running on Vercel" });
});
app.use((err, _req, res, _next) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred."
  });
});
var index_default = app;
export {
  index_default as default
};
