import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";

async function getAuthenticatedBusiness() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      error: "Please login first.",
      status: 401,
    };
  }

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch {
    return {
      error: "Invalid or expired token.",
      status: 401,
    };
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    return {
      error: "User not found.",
      status: 404,
    };
  }

  if (user.role !== "business") {
    return {
      error: "Only business users can use this tool.",
      status: 403,
    };
  }

  if (!user.onboardingCompleted) {
    return {
      error: "Complete business onboarding first.",
      status: 403,
    };
  }

  return { user };
}

export async function POST(request) {
  try {
    await connectDB();

    const auth = await getAuthenticatedBusiness();

    if (auth.error) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error,
        },
        {
          status: auth.status,
        }
      );
    }

    const body = await request.json();

    const {
      topic,
      platform = "Instagram",
      city = "",
      count = 20,
    } = body;

    if (!topic?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Business topic is required.",
        },
        {
          status: 400,
        }
      );
    }

    const hashtagCount = Math.min(
      Math.max(Number(count) || 20, 5),
      30
    );

    const profile = await BusinessProfile.findOne({
      user: auth.user._id,
    }).lean();

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "Business profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const businessCity =
      city.trim() || profile.city || "";

    const prompt = `
You are Trendora, an expert social media hashtag strategist.

Generate exactly ${hashtagCount} hashtags for a business.

Business name: ${profile.businessName || "Local business"}
Business type: ${profile.businessType || "Business"}
Topic: ${topic.trim()}
City: ${businessCity || "Not provided"}
Platform: ${platform}
Services: ${(profile.services || []).join(", ")}

Rules:
- Return exactly ${hashtagCount} unique hashtags.
- Include niche, industry, local and audience-relevant hashtags.
- Use the city naturally in some hashtags when available.
- Do not use irrelevant or spam hashtags.
- Do not number the hashtags.
- Do not use markdown.
- Return hashtags separated by spaces.
- Every item must begin with #.
`;

    const interaction = await gemini.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });

    const rawOutput = interaction.output_text?.trim();

    if (!rawOutput) {
      return NextResponse.json(
        {
          success: false,
          message: "AI did not generate hashtags.",
        },
        {
          status: 503,
        }
      );
    }

    const hashtags = [
      ...new Set(
        rawOutput
          .replaceAll("\n", " ")
          .split(/\s+/)
          .map((tag) => tag.trim())
          .filter((tag) => tag.startsWith("#"))
      ),
    ]
      .slice(0, hashtagCount)
      .join(" ");

    return NextResponse.json({
      success: true,
      message: "Hashtags generated successfully.",
      data: {
        hashtags,
        topic: topic.trim(),
        city: businessCity,
        platform,
        count: hashtags
          .split(/\s+/)
          .filter(Boolean).length,
      },
    });
  } catch (error) {
    console.error("Business hashtag error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate business hashtags.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}