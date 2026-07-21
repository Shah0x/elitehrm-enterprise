import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const getHRAIInsights = async (attendanceData: any[], leaveData: any[]) => {
  try {
    const prompt = `Analyze this HR data for a company and provide 3 key professional insights or recommendations:
    
    Attendance Summary: ${JSON.stringify(attendanceData)}
    Leave Requests: ${JSON.stringify(leaveData)}
    
    Focus on trends like punctuality, potential burnout, or resource planning. Keep it high-end and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an Elite HR AI Assistant for a Fortune 500 company. provide concise, high-value strategic insights.",
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini AI Insight Error:", error);
    return "Unable to generate smart insights at this moment. Please check back later.";
  }
};
