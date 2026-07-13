import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import CreatorProfile from "@/models/CreatorProfile";
import GeneratedContent from "@/models/GeneratedContent";

export async function POST(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    let decoded;

    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token.",
        },
        { status: 401 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please send caption details in JSON format.",
        },
        { status: 400 }
      );
    }

    const topic = body.topic?.trim();
    const customTone = body.tone?.trim();
    const customGoal = body.goal?.trim();
    const captionLength = body.captionLength?.trim() || "medium";

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          message: "Topic is required.",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    if (user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only creators can use the caption generator.",
        },
        { status: 403 }
      );
    }

    if (!user.onboardingCompleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete creator onboarding first.",
        },
        { status: 403 }
      );
    }

    const creatorProfile = await CreatorProfile.findOne({
      user: user._id,
    });

    if (!creatorProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator profile not found.",
        },
        { status: 404 }
      );
    }

    const tone = customTone || creatorProfile.tone;
    const goal = customGoal || creatorProfile.goal;
    const currentYear = new Date().getFullYear();

    const prompt = `
You are Trendora, an expert social media caption writer.

Create social media content for this creator.

Topic: ${topic}
Niche: ${creatorProfile.niche}
Platform: ${creatorProfile.platform}
Language: ${creatorProfile.language}
Tone: ${tone}
Goal: ${goal}
Caption length: ${captionLength}
Current year: ${currentYear}

Return exactly this structure:

CAPTION:
Write one engaging caption.

CTA:
Write one clear call to action.

HASHTAGS:
Write 8 relevant hashtags.

Rules:
- Write in ${creatorProfile.language}.
- Make the caption suitable for ${creatorProfile.platform}.
- Keep the caption ${captionLength}.
- Use natural language.
- Do not invent statistics.
- Avoid guaranteed claims.
- Use the current year only when needed.
- Do not use markdown tables.
`;

    const interaction = await gemini.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });

    const output = interaction.output_text?.trim();

    if (!output) {
      return NextResponse.json(
        {
          success: false,
          message: "AI did not return a caption.",
        },
        { status: 502 }
      );
    }

    const generatedContent = await GeneratedContent.create({
      user: user._id,
      type: "caption",
      prompt,
      output,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Caption generated successfully.",
        data: {
          id: generatedContent._id.toString(),
          type: generatedContent.type,
          topic,
          output,
          createdAt: generatedContent.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Caption generator API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate caption.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}