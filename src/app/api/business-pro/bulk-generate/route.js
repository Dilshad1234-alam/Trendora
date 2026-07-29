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
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest"];
    const results = [];

    // Process all topics in parallel for speed
    await Promise.all(topics.map(async (topic) => {
      const prompt = `
        You are an elite AI copywriter.
        Brand Name: ${profile.businessName}
        ${brandVoice}
        Target Audience: ${profile.targetAudience || "General"}
        
        Generate a highly engaging, converting piece of content for a ${contentType} about "${topic}".
        Do NOT wrap in markdown code blocks. Just output the content directly.
      `;

      let output = null;
      for (const modelName of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              output = data.candidates[0].content.parts[0].text;
              break;
            }
          }
        } catch (e) {
          console.error(`Gemini Fetch Error (${modelName}):`, e.message || e);
        }
      }

      if (output) {
        const saved = await SavedContent.create({
          user: auth.user._id,
          ownerType: "business",
          type: contentType || "business-post",
          title: topic,
          content: output,
        });
        results.push(saved);
      } else {
        results.push({
          topic,
          content: "Failed to generate content for this topic.",
          error: true
        });
      }
    }));

    return NextResponse.json({ 
      success: true,
      message: `Successfully generated ${results.length} items.`,
      data: results 
    }, { status: 201 });

  } catch (error) {
    console.error("Bulk Generate Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process bulk generation" }, { status: 500 });
  }
}
