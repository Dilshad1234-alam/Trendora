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

const allowedLengths = ["short", "medium", "long"];

export async function POST(request) {
  try {
    await connectDB();

    // 1. Token check
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

    // 2. Token verify
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

    // 3. Request body
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please send video details in JSON format.",
        },
        { status: 400 }
      );
    }

    const title = body.title?.trim();
    const summary = body.summary?.trim() || "";
    const keywords = body.keywords?.trim() || "";
    const customPlatform = body.platform?.trim().toLowerCase();
    const customTone = body.tone?.trim();
    const descriptionLength =
      body.descriptionLength?.trim().toLowerCase() || "medium";

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Video title is required.",
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

    if (!allowedLengths.includes(descriptionLength)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid description length.",
        },
        { status: 400 }
      );
    }

    // 4. User check
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
            "Only creators can use the video description generator.",
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

    // 5. Creator profile
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
      customPlatform || creatorProfile.platform || "youtube";

    const tone =
      customTone || creatorProfile.tone || "professional";

    const language =
      creatorProfile.language || "english";

    const currentYear = new Date().getFullYear();

    const prompt = `
You are Trendora, an expert social media video-description and SEO writer.

Create a complete video description.

Creator details:
Video title: ${title}
Video summary: ${summary || "Create a relevant summary from the title"}
User keywords: ${keywords || "Generate relevant keywords"}
Niche: ${creatorProfile.niche}
Platform: ${platform}
Language: ${language}
Tone: ${tone}
Description length: ${descriptionLength}
Audience size: ${creatorProfile.audienceSize}
Creator goal: ${creatorProfile.goal}
Current year: ${currentYear}

Return exactly this structure:

SEO DESCRIPTION:
Write one engaging and SEO-friendly ${descriptionLength} description.

SHORT DESCRIPTION:
Write a short 1-2 sentence description.

KEY POINTS:
- Point 1
- Point 2
- Point 3

CALL TO ACTION:
Write one clear CTA.

SEO KEYWORDS:
Write 10 relevant comma-separated keywords.

HASHTAGS:
Write 8 relevant hashtags in one line.

Rules:
- Write in ${language}.
- Make the result suitable for ${platform}.
- Use the video title and summary naturally.
- Do not keyword-stuff.
- Do not invent facts, statistics or personal experiences.
- Do not promise guaranteed views, followers, jobs or sales.
- Do not use outdated years.
- Every hashtag must start with #.
- Do not use markdown tables.
`;

    /*
      IMPORTANT:
      Yahan wahi Gemini call aur model use karo
      jo aapke Hook/Script API me successfully work kar raha hai.
    */

    const interaction = await gemini.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });

    const output = interaction.output_text?.trim();

    if (!output) {
      return NextResponse.json(
        {
          success: false,
          message: "AI did not return a video description.",
        },
        { status: 502 }
      );
    }

    // 6. MongoDB save
    const generatedContent = await GeneratedContent.create({
      user: user._id,
      type: "video-description",
      prompt,
      output,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Video description generated successfully.",
        data: {
          id: generatedContent._id.toString(),
          type: generatedContent.type,
          title,
          output,
          createdAt: generatedContent.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Video description generator API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate video description.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}