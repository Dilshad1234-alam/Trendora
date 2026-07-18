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
          message: "Please send script details in JSON format.",
        },
        { status: 400 }
      );
    }

    const topic = body.topic?.trim();
    const selectedHook = body.hook?.trim() || "";
    const duration = body.duration?.trim() || "30 seconds";
    const customTone = body.tone?.trim();

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
          message: "Only creators can use the script generator.",
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
    const currentYear = new Date().getFullYear();

    const prompt = `
You are Trendora, an expert short-form video script writer.

Create a ready-to-record short video script.

Creator details:
Topic: ${topic}
Selected hook: ${selectedHook || "Generate the best hook"}
Niche: ${creatorProfile.niche}
Platform: ${creatorProfile.platform}
Language: ${creatorProfile.language}
Tone: ${tone}
Audience size: ${creatorProfile.audienceSize}
Goal: ${creatorProfile.goal}
Duration: ${duration}
Current year: ${currentYear}

Return exactly this structure:

HOOK:
One short attention-grabbing opening line.

SCENE 1:
Visual:
Voiceover:

SCENE 2:
Visual:
Voiceover:

SCENE 3:
Visual:
Voiceover:

SCENE 4:
Visual:
Voiceover:

SCENE 5:
Visual:
Voiceover:

CTA:
One clear call to action.

CAPTION:
One platform-ready caption.

HASHTAGS:
8 relevant hashtags.

Rules:
- Write in ${creatorProfile.language}.
- Keep the complete script suitable for ${duration}.
- Use natural, easy-to-speak sentences.
- Do not invent statistics or personal experiences.
- Never use outdated years.
- Avoid guaranteed claims.
- Do not use a markdown table.
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
      message: "AI did not return a script.",
    },
    { status: 502 }
  );
}


    const generatedContent = await GeneratedContent.create({
      user: user._id,
      type: "script",
      prompt,
      output,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Script generated successfully.",
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
    console.error("Script generator API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate script.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}