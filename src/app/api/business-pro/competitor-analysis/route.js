import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import SavedContent from "@/models/SavedContent";
import connectDB from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const checkProAccess = async () => {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user || user.plan !== "business-pro") {
      return { error: "Business Pro plan required.", status: 403 };
    }
    return { user };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

export async function POST(request) {
  try {
    const auth = await checkProAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { competitorName, focusArea } = body;

    if (!competitorName) {
      return NextResponse.json({ error: "Competitor name is required" }, { status: 400 });
    }

    const profile = await BusinessProfile.findOne({ user: auth.user._id });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const brandVoice = profile.brandVoiceTone ? `(Brand Voice Tone: ${profile.brandVoiceTone})` : "";
    const prompt = `
      You are an expert business strategist and competitive analyst.
      Analyze the competitor named: "${competitorName}".
      My business is: ${profile.businessName} (${profile.businessType}) in ${profile.city}.
      Focus area for analysis: ${focusArea || "General Marketing Strategy"}
      ${brandVoice}

      Please provide a highly structured, professional analysis covering:
      1. Estimated Strengths of ${competitorName}
      2. Potential Weaknesses of ${competitorName}
      3. Actionable Counter-Strategies for my business (${profile.businessName}) to beat them.

      Make it punchy, insightful, and strictly formatted using Markdown. Keep it concise.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const savedItem = await SavedContent.create({
      user: auth.user._id,
      ownerType: "business",
      type: "competitor-analysis",
      title: `Competitor Analysis: ${competitorName}`,
      content: responseText,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Analysis generated successfully.",
      data: savedItem 
    }, { status: 201 });

  } catch (error) {
    console.error("Competitor Analysis Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate competitor analysis" }, { status: 500 });
  }
}
