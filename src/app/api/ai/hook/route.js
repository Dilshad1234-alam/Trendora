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

    // 1. JWT cookie read
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

    // 2. JWT verify
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

    // 3. Request body read
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please send hook details in JSON format.",
        },
        { status: 400 }
      );
    }

    const topic = body.topic?.trim();
    const customTone = body.tone?.trim();
    const goal = body.goal?.trim();

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          message: "Topic is required.",
        },
        { status: 400 }
      );
    }

    // 4. Logged-in user fetch
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
          message: "Only creators can use the hook generator.",
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

    // 5. Creator profile fetch
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
    const creatorGoal = goal || creatorProfile.goal;

    // 6. AI prompt
    const prompt = `
You are Trendora, an expert short-form content strategist.

Generate 5 high-quality social media hooks for the following creator.

Topic: ${topic}
Niche: ${creatorProfile.niche}
Platform: ${creatorProfile.platform}
Language: ${creatorProfile.language}
Tone: ${tone}
Audience size: ${creatorProfile.audienceSize}
Creator goal: ${creatorGoal}

Generate exactly these five hook types:

1. Curiosity Hook
2. Emotional Hook
3. Relatable Hook
4. Authority Hook
5. Contrarian Hook

Rules:
- Write in the selected creator language.
- Keep every hook short and natural.
- Make hooks suitable for Instagram Reels or YouTube Shorts.
- Do not add explanations.
- Do not use markdown tables.
- Return each hook with its hook type as a heading.
`;

    // 7. Gemini call
    const interaction = await gemini.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
      generation_config: {
        thinking_level: "low",
      },
    });

    const output = interaction.output_text?.trim();

    if (!output) {
      return NextResponse.json(
        {
          success: false,
          message: "AI did not return any hooks.",
        },
        { status: 502 }
      );
    }

    // 8. MongoDB save
    const generatedContent = await GeneratedContent.create({
      user: user._id,
      type: "hook",
      prompt,
      output,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Hooks generated successfully.",
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
    console.error("Hook generator API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate hooks.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}