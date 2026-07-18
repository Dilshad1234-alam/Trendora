import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";

const getAuthenticatedBusiness = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      error: "Unauthorized. Please login first.",
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

  if (!user.planSelected || !user.plan) {
    return {
      error: "Please select a plan first.",
      status: 403,
    };
  }

  return { user };
};

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

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please send valid JSON data.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      topic,
      platform = "Instagram",
      tone = "Professional",
      cta = "DM Us",
      emoji = true,
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

    const prompt = `
You are Trendora, an expert social-media copywriter for local businesses.

Create one high-quality business caption.

Business details:
Business name: ${profile.businessName}
Business type: ${profile.businessType}
City: ${profile.city}
Services: ${(profile.services || []).join(", ")}
Target customers: ${
      profile.targetCustomers || "Local customers"
    }
Business goal: ${profile.goal || "Grow business"}

Caption request:
Topic: ${topic.trim()}
Platform: ${platform}
Tone: ${tone}
CTA style: ${cta}
Use emojis: ${emoji ? "Yes" : "No"}

Rules:
- Make the caption suitable for ${platform}.
- Focus on customer benefits.
- Mention the city naturally when useful.
- Use a strong opening line.
- Add one clear call to action.
- Do not invent prices, discounts, addresses, statistics or guarantees.
- ${
      emoji
        ? "Use relevant emojis naturally."
        : "Do not use emojis."
    }
- Do not add hashtags.
- Do not use markdown formatting.
- Return only the final caption.
`;

    const interaction = await gemini.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });

    const caption = interaction.output_text?.trim();

    if (!caption) {
      return NextResponse.json(
        {
          success: false,
          message: "AI did not generate a caption.",
        },
        {
          status: 503,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Business caption generated successfully.",
        data: {
          caption,
          topic: topic.trim(),
          platform,
          tone,
          cta,
          emoji: Boolean(emoji),
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Business caption error:", error);

    if (
      error?.status === 429 ||
      error?.statusCode === 429
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AI request limit reached. Please wait and try again.",
        },
        {
          status: 429,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate business caption.",
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