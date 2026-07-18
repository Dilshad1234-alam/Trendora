import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import CreatorProfile from "@/models/CreatorProfile";
import GeneratedContent from "@/models/GeneratedContent";

const allowedPlatforms = [
  "youtube",
  "instagram",
  "facebook",
  "linkedin",
];

const allowedStyles = [
  "curiosity",
  "authority",
  "emotional",
  "contrarian",
  "educational",
  "mixed",
];

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
          message: "Please send title details in JSON format.",
        },
        { status: 400 }
      );
    }

    const topic = body.topic?.trim();
    const customPlatform = body.platform?.trim().toLowerCase();
    const customTone = body.tone?.trim();
    const titleStyle = body.titleStyle?.trim().toLowerCase() || "mixed";
    const titleCount = Number(body.titleCount) || 10;

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          message: "Topic is required.",
        },
        { status: 400 }
      );
    }

    if (
      customPlatform &&
      !allowedPlatforms.includes(customPlatform)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid platform.",
        },
        { status: 400 }
      );
    }

    if (!allowedStyles.includes(titleStyle)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid title style.",
        },
        { status: 400 }
      );
    }

    if (titleCount < 5 || titleCount > 20) {
      return NextResponse.json(
        {
          success: false,
          message: "Title count must be between 5 and 20.",
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
          message:
            "Only creators can use the thumbnail title generator.",
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

    const platform =
      customPlatform || creatorProfile.platform;

    const tone =
      customTone || creatorProfile.tone;

    const language =
      creatorProfile.language || "english";

    const prompt = `
You are Trendora, an expert thumbnail-title and video-title strategist.

Create ${titleCount} short and clickable thumbnail titles for this content.

Creator details:
Topic: ${topic}
Niche: ${creatorProfile.niche}
Platform: ${platform}
Language: ${language}
Tone: ${tone}
Title style: ${titleStyle}
Audience size: ${creatorProfile.audienceSize}
Creator goal: ${creatorProfile.goal}

Return exactly this structure:

THUMBNAIL TITLES:
1. title
2. title
3. title

BEST RECOMMENDED TITLE:
Write the strongest title.

WHY IT WORKS:
Explain in one short sentence.

Rules:
- Write in ${language}.
- Generate exactly ${titleCount} unique titles.
- Keep each title short and easy to read.
- Prefer 3 to 7 words per title.
- Make titles suitable for ${platform}.
- Match the selected ${titleStyle} style.
- Do not use misleading clickbait.
- Do not promise guaranteed results.
- Do not invent statistics.
- Avoid unnecessary punctuation.
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
          message: "AI did not return thumbnail titles.",
        },
        { status: 502 }
      );
    }

    const generatedContent = await GeneratedContent.create({
      user: user._id,
      type: "thumbnail-title",
      prompt,
      output,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thumbnail titles generated successfully.",
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
    console.error(
      "Thumbnail title generator API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate thumbnail titles.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}