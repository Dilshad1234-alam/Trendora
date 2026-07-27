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
    const { topics, contentType } = body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: "Please provide an array of topics." }, { status: 400 });
    }

    const profile = await BusinessProfile.findOne({ user: auth.user._id });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const brandVoice = `Tone: ${profile.brandVoiceTone || "Professional"}. Instructions: ${profile.brandVoiceInstructions || "None"}.`;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const results = [];

    // Process all topics in parallel for speed
    const generationPromises = topics.map(async (topic) => {
      const prompt = `
        You are an expert copywriter.
        Write a ${contentType} about "${topic}".
        My business: ${profile.businessName} (${profile.businessType}) in ${profile.city}.
        Target audience: ${profile.targetCustomers}.
        BRAND VOICE Rules: ${brandVoice}.
        
        Provide only the final content, ready to be copied and pasted.
      `;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      return SavedContent.create({
        user: auth.user._id,
        ownerType: "business",
        type: contentType || "business-post",
        title: topic,
        content: text,
      });
    });

    const generatedItems = await Promise.all(generationPromises);

    return NextResponse.json({ 
      success: true,
      message: `Successfully generated ${generatedItems.length} items.`,
      data: generatedItems 
    }, { status: 201 });

  } catch (error) {
    console.error("Bulk Generate Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process bulk generation" }, { status: 500 });
  }
}
