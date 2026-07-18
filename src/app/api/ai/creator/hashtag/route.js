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

    // JWT cookie read
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

    // JWT verify
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

    // Request body read
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please send hashtag details in JSON format.",
        },
        { status: 400 }
      );
    }

    const topic = body.topic?.trim();
    const customPlatform = body.platform?.trim();
    const customLanguage = body.language?.trim();
    const hashtagCount = Number(body.hashtagCount) || 20;

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          message: "Topic is required.",
        },
        { status: 400 }
      );
    }

    if (hashtagCount < 5 || hashtagCount > 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Hashtag count must be between 5 and 30.",
        },
        { status: 400 }
      );
    }

    // User check
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
          message: "Only creators can use the hashtag generator.",
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

    // Creator profile
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

    const platform =
      customPlatform || creatorProfile.platform;

    const language =
      customLanguage || creatorProfile.language;

    const prompt = `
You are Trendora, an expert social-media hashtag strategist.

Create ${hashtagCount} useful hashtags for the following content.

Creator details:
Topic: ${topic}
Niche: ${creatorProfile.niche}
Platform: ${platform}
Language: ${language}
Audience size: ${creatorProfile.audienceSize}
Creator goal: ${creatorProfile.goal}

Return exactly this structure:

BROAD HASHTAGS:
Write general high-relevance hashtags.

NICHE HASHTAGS:
Write hashtags specifically related to the creator niche and topic.

LOW-COMPETITION HASHTAGS:
Write more specific hashtags suitable for smaller creators.

COMMUNITY HASHTAGS:
Write audience or community-focused hashtags.

RECOMMENDED FINAL SET:
Write the best final hashtags in one copy-ready line.

Rules:
- Generate exactly ${hashtagCount} unique hashtags in total.
- Every hashtag must begin with #.
- Do not repeat any hashtag.
- Do not include spaces inside hashtags.
- Keep them directly relevant to the topic.
- Avoid misleading or unrelated trending hashtags.
- Make them suitable for ${platform}.
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
          message: "AI did not return hashtags.",
        },
        { status: 502 }
      );
    }

    const generatedContent = await GeneratedContent.create({
      user: user._id,
      type: "hashtag",
      prompt,
      output,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Hashtags generated successfully.",
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
    console.error("Hashtag generator API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate hashtags.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}