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
          message: "Please send valid JSON data.",
        },
        { status: 400 }
      );
    }

    const topic = body.topic?.trim();
    const platform =
      body.platform?.trim().toLowerCase() || "instagram";
    const postType =
      body.postType?.trim().toLowerCase() || "promotional";
    const tone = body.tone?.trim() || "professional";
    const offer = body.offer?.trim() || "";
    const customCTA = body.cta?.trim() || "";

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          message: "Post topic is required.",
        },
        { status: 400 }
      );
    }

    if (!allowedPlatforms.includes(platform)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid platform.",
        },
        { status: 400 }
      );
    }

    if (!allowedPostTypes.includes(postType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid post type.",
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

    if (user.role !== "business") {
      return NextResponse.json(
        {
          success: false,
          message: "Only business users can use this tool.",
        },
        { status: 403 }
      );
    }

    if (!user.onboardingCompleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete business onboarding first.",
        },
        { status: 403 }
      );
    }

    const businessProfile = await BusinessProfile.findOne({
      user: user._id,
    });

    if (!businessProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Business profile not found.",
        },
        { status: 404 }
      );
    }

    const services = Array.isArray(businessProfile.services)
      ? businessProfile.services.join(", ")
      : businessProfile.services || "";

    const prompt = `
You are Trendora, an expert local-business social media strategist.

Create a ready-to-publish business post.

Business details:
Business name: ${businessProfile.businessName}
Business type: ${businessProfile.businessType}
City: ${businessProfile.city}
Services: ${services}
Target customers: ${businessProfile.targetCustomers || "local customers"}
Primary goal: ${businessProfile.primaryGoal}
Current online presence: ${
      businessProfile.currentOnlinePresence || "not provided"
    }

Post details:
Topic: ${topic}
Platform: ${platform}
Post type: ${postType}
Tone: ${tone}
Offer: ${offer || "No specific offer"}
Custom CTA: ${customCTA || "Generate the best CTA"}

Return exactly this structure:

HEADLINE:
Write one short headline.

POST:
Write one engaging and ready-to-publish post.

KEY BENEFITS:
- Benefit 1
- Benefit 2
- Benefit 3

CALL TO ACTION:
Write one clear local-business CTA.

HASHTAGS:
Write 8 relevant hashtags.

Rules:
- Mention the business city naturally when useful.
- Keep the post suitable for ${platform}.
- Do not invent reviews, customer numbers or statistics.
- Do not promise guaranteed results.
- Do not use a markdown table.
- Use natural and easy-to-understand language.
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
          message: "AI did not return a business post.",
        },
        { status: 502 }
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
          output,
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
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}