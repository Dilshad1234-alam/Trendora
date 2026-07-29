import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import GeneratedContent from "@/models/GeneratedContent";

const allowedPlatforms = [
  "instagram",
  "facebook",
  "linkedin",
  "google-business",
];

const allowedPostTypes = [
  "promotional",
  "educational",
  "offer",
  "service",
  "testimonial",
  "festival",
  "engagement",
];

const getAuthenticatedBusinessPro = async () => {
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
    return { error: "Please complete business onboarding first.", status: 403 };
  }

  return { user };
};

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

    const topic = String(body.topic || "").trim().slice(0, 250);
    const platform = String(body.platform || "instagram").trim().toLowerCase();
    const postType = String(body.postType || "promotional").trim().toLowerCase();
    const tone = String(body.tone || "professional").trim().slice(0, 100);
    const offer = String(body.offer || "").trim().slice(0, 300);
    const customCTA = String(body.cta || "").trim().slice(0, 250);

    if (!topic) {
      return NextResponse.json({ success: false, message: "Post topic is required." }, { status: 400 });
    }
    if (!allowedPlatforms.includes(platform)) {
      return NextResponse.json({ success: false, message: "Invalid post platform." }, { status: 400 });
    }
    if (!allowedPostTypes.includes(postType)) {
      return NextResponse.json({ success: false, message: "Invalid post type." }, { status: 400 });
    }

    const businessProfile = await BusinessProfile.findOne({ user: user._id }).lean();

    if (!businessProfile) {
      return NextResponse.json({ success: false, message: "Business profile not found." }, { status: 404 });
    }

    const services = Array.isArray(businessProfile.services)
      ? businessProfile.services.filter(Boolean).join(", ")
      : businessProfile.services || "";
    const businessGoal = businessProfile.goal || businessProfile.primaryGoal || "Grow the business";
    const onlinePresence = businessProfile.onlinePresence || businessProfile.currentOnlinePresence || "Not provided";
    const targetCustomers = businessProfile.targetCustomers || "Local customers";

    const prompt = `
You are Trendora, an expert local-business social media strategist.

Create ONE high-quality, ready-to-publish social media post for a local business.

BUSINESS DETAILS

Business name:
${businessProfile.businessName}

Business type:
${businessProfile.businessType}

City:
${businessProfile.city}

Services:
${services || "Not provided"}

Target customers:
${targetCustomers}

Primary business goal:
${businessGoal}

Current online presence:
${onlinePresence}

POST REQUIREMENTS

Topic:
${topic}

Platform:
${platform}

Post type:
${postType}

Tone:
${tone}

Offer:
${offer || "No specific offer provided"}

Custom call to action:
${customCTA || "Generate the most suitable CTA"}

RETURN EXACTLY THIS STRUCTURE:

HEADLINE:
Write one short and engaging headline.

POST:
Write one ready-to-publish social media post.

KEY BENEFITS:
- Benefit 1
- Benefit 2
- Benefit 3

CALL TO ACTION:
Write one clear and practical call to action.

HASHTAGS:
Write exactly 8 relevant hashtags.

RULES:

- Keep the complete response concise and ready to publish.
- Keep the post suitable for ${platform}.
- Use natural and easy-to-understand language.
- Match the requested ${tone} tone.
- Mention ${businessProfile.city} naturally only when relevant.
- Focus on the listed business services.
- Use the custom CTA when provided.
- Use the offer only when provided.
- Do not invent prices or discounts.
- Do not invent reviews or testimonials.
- Do not invent customer numbers or statistics.
- Do not promise guaranteed results.
- Do not create a markdown table.
- Do not include explanations outside the required structure.
- Keep the main post under 180 words.
`;

    let output;
    try {
      const interaction = await gemini.interactions.create({
        model: "gemini-3.6-flash",
        input: prompt,
      });

      output = interaction.output_text?.trim();

      if (!output) {
        return NextResponse.json({ success: false, message: "AI did not return a business post." }, { status: 502 });
      }
    } catch (aiError) {
      console.error("Business post AI error:", aiError);
      if (aiError?.status === 429 || aiError?.statusCode === 429 || aiError?.code === 429) {
        return NextResponse.json(
          { success: false, message: "AI request limit reached. Please wait a few minutes and try again." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "AI could not generate the business post. Please try again.",
          error: process.env.NODE_ENV === "development" ? aiError.message : undefined,
        },
        { status: 503 }
      );
    }

    const generatedContent = await GeneratedContent.create({
      user: user._id,
      type: "business-post",
      prompt,
      output,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Business post generated successfully.",
        data: {
          id: generatedContent._id.toString(),
          type: generatedContent.type,
          topic,
          platform,
          postType,
          tone,
          output,
          plan: "business-pro",
          dailyLimit: null,
          usedToday: null,
          remainingFreePosts: null,
          createdAt: generatedContent.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Business post generator error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate business post.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
