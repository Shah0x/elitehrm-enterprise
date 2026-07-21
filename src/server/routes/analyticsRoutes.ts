import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import Attendance from '../models/Attendance.ts';
import Leave from '../models/Leave.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = express.Router();

// Initialize GoogleGenAI client on the server side
// Note: We MUST set the User-Agent header to 'aistudio-build' in httpOptions for telemetry.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// GET /api/analytics/insights (Admin Only)
router.get('/insights', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // 1. Fetch recent attendance logs
    const recentAttendance = await Attendance.find()
      .populate('userId', 'firstName lastName department')
      .sort({ date: -1 })
      .limit(50);

    // 2. Fetch recent leave requests
    const recentLeaves = await Leave.find()
      .populate('userId', 'firstName lastName department')
      .sort({ createdAt: -1 })
      .limit(30);

    // 3. Format data summary to feed to the AI
    const attendanceSummary = recentAttendance.map(a => ({
      employeeName: a.userId ? `${(a.userId as any).firstName} ${(a.userId as any).lastName}` : 'Unknown',
      department: a.userId ? (a.userId as any).department : 'Unknown',
      date: a.date.toDateString(),
      status: a.status,
      checkIn: a.checkIn ? a.checkIn.toLocaleTimeString() : 'N/A',
      checkOut: a.checkOut ? a.checkOut.toLocaleTimeString() : 'N/A'
    }));

    const leaveSummary = recentLeaves.map(l => ({
      employeeName: l.userId ? `${(l.userId as any).firstName} ${(l.userId as any).lastName}` : 'Unknown',
      department: l.userId ? (l.userId as any).department : 'Unknown',
      leaveType: l.leaveType,
      duration: `${l.startDate.toDateString()} to ${l.endDate.toDateString()}`,
      status: l.status,
      reason: l.reason
    }));

    // 4. Construct prompt
    const prompt = `You are an elite, executive-level Chief Human Resources Officer (CHRO). Analyze the following real-time company workforce datasets and provide 3 high-impact, strategic, and professional insights or recommendations.
    
    ATTENDANCE DATASET (Last 50 Records):
    ${JSON.stringify(attendanceSummary, null, 2)}
    
    LEAVE REQUESTS DATASET (Last 30 Records):
    ${JSON.stringify(leaveSummary, null, 2)}
    
    Provide 3 distinct strategic items. Each item must have:
    - title: Short, professional title (e.g., "Punctuality Correction" or "Overtime Risk Detected").
    - insight: A detailed, highly sophisticated analysis of the trend with a proactive strategic recommendation.
    - tag: One-word category tag (e.g., "Burnout", "Efficiency", "Scheduling", "Compliance").`;

    // 5. Generate content using gemini-3.5-flash with a strict JSON schema
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a Fortune 500 Chief Human Resources Officer. Write formal, high-value executive-level findings in structured JSON format.",
        responseMimeType: 'application/json',
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
  } catch (error: any) {
    console.error("Gemini AI Insight Error:", error);
    res.status(500).json({ 
      message: 'Failed to generate strategic insights via Gemini AI.',
      error: error.message 
    });
  }
});

export default router;
