import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import GeneratedContent from "@/models/GeneratedContent";

const allowedPlatforms = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "Google Business",
];

const allowedTones = [
  "Professional",
  "Friendly",
  "Promotional",
  "Luxury",
  "Casual",
  "Emotional",
];

const allowedCTAOptions = [
  "DM Us",
  "Call Now",
  "Book Today",
  "Visit Store",
  "Contact Us",
  "Learn More",
];

async function getAuthenticatedBusinessPro() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { error: "Unauthorized. Please login first.", status: 401 };
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return { error: "Invalid or expired token.", status: 401 };
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    return { error: "User not found.", status: 404 };
  }

  if (user.plan !== "business-pro") {
    return { error: "Only Business Pro users can use this tool.", status: 403 };
  }

  if (!user.onboardingCompleted) {
    return { error: "Complete business onboarding first.", status: 403 };
  }

  return { user };
}

export async function POST(request) {
  try {
    await connectDB();

    const auth = await getAuthenticatedBusinessPro();

    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error, upgradeRequired: Boolean(auth.upgradeRequired) },
        { status: auth.status }
      );
    }

    const user = auth.user;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Please send valid JSON data." }, { status: 400 });
    }

    const topic = String(body.topic || "").trim().slice(0, 300);
    const platform = String(body.platform || "Instagram").trim();
    const tone = String(body.tone || "Professional").trim();
    const cta = String(body.cta || "DM Us").trim();
    const emoji = Boolean(body.emoji);

    if (!topic) {
      return NextResponse.json({ success: false, message: "Business topic is required." }, { status: 400 });
    }

    if (!allowedPlatforms.includes(platform)) {
      return NextResponse.json({ success: false, message: "Invalid social-media platform." }, { status: 400 });
    }

    if (!allowedTones.includes(tone)) {
      return NextResponse.json({ success: false, message: "Invalid caption tone." }, { status: 400 });
    }

    if (!allowedCTAOptions.includes(cta)) {
      return NextResponse.json({ success: false, message: "Invalid call-to-action option." }, { status: 400 });
    }

    const profile = await BusinessProfile.findOne({ user: user._id }).lean();
    if (!profile) {
      return NextResponse.json({ success: false, message: "Business profile not found." }, { status: 404 });
    }

    const services = Array.isArray(profile.services)
      ? profile.services.filter(Boolean).join(", ")
      : profile.services || "Not provided";

    const businessGoal = profile.goal || profile.primaryGoal || "Grow the business";
    const targetCustomers = profile.targetCustomers || "Local customers";

    const prompt = `
You are Trendora, an expert social-media copywriter for local businesses.

Create ONE high-quality and ready-to-publish business caption.

BUSINESS DETAILS

Business name:
${profile.businessName || "Local business"}

Business type:
${profile.businessType || "Business"}

City:
${profile.city || "Not provided"}

Services:
${services}

Target customers:
${targetCustomers}

Business goal:
${businessGoal}

CAPTION REQUIREMENTS

Topic:
${topic}

Platform:
${platform}

Tone:
${tone}

Call-to-action style:
${cta}

Use emojis:
${emoji ? "Yes" : "No"}

RULES

- Return only the final caption.
- Do not add headings such as Caption or Result.
- Make the caption suitable for ${platform}.
- Use a strong and relevant opening line.
- Focus on customer needs and benefits.
- Mention ${profile.city || "the city"} naturally only when relevant.
- Include one clear ${cta} call to action.
- ${emoji ? "Use relevant emojis naturally, but do not overuse them." : "Do not use any emojis."}
- Do not include hashtags.
- Do not invent prices or discounts.
- Do not invent addresses or contact information.
- Do not invent reviews, statistics or customer numbers.
- Do not promise guaranteed results.
- Do not use markdown formatting.
- Keep the caption concise and easy to understand.
- Keep the caption below 180 words.
`;

    let caption;
    try {
      const interaction = await gemini.interactions.create({
        model: "gemini-3.6-flash",
        input: prompt,
      });

      caption = interaction.output_text?.trim();

      if (!caption) {
        return NextResponse.json({ success: false, message: "AI did not generate a caption." }, { status: 502 });
      }
    } catch (aiError) {
      console.error("Business caption AI error:", aiError);

      if (aiError?.status === 429 || aiError?.statusCode === 429 || aiError?.code === 429) {
        return NextResponse.json(
          { success: false, message: "AI request limit reached. Please wait a few minutes and try again." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "AI could not generate the business caption. Please try again.",
          error: process.env.NODE_ENV === "development" ? aiError?.message : undefined,
        },
        { status: 503 }
      );
    }

    const generatedContent = await GeneratedContent.create({
      user: user._id,
      type: "business-caption",
      prompt,
      output: caption,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Business caption generated successfully.",
        data: {
          id: generatedContent._id.toString(),
          type: generatedContent.type,
          caption,
          topic,
          platform,
          tone,
          cta,
          emoji,
          plan: "business-pro",
          dailyLimit: null,
          usedToday: null,
          remainingFreeCaptions: null,
          createdAt: generatedContent.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Business caption generator error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate business caption.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
