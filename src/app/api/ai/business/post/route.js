import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import GeneratedContent from "@/models/GeneratedContent";

const FREE_DAILY_POST_LIMIT = 3;

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

const getIndiaDayRange = () => {
  const IST_OFFSET = 330 * 60 * 1000;

  const now = new Date();

  const istNow = new Date(
    now.getTime() + IST_OFFSET
  );

  const startOfDay = new Date(
    Date.UTC(
      istNow.getUTCFullYear(),
      istNow.getUTCMonth(),
      istNow.getUTCDate()
    ) - IST_OFFSET
  );

  const endOfDay = new Date(
    startOfDay.getTime() +
      24 * 60 * 60 * 1000
  );

  return {
    startOfDay,
    endOfDay,
  };
};

const getAuthenticatedBusiness = async () => {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("token")?.value;

  if (!token) {
    return {
      error:
        "Unauthorized. Please login first.",
      status: 401,
    };
  }

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch {
    return {
      error:
        "Invalid or expired token.",
      status: 401,
    };
  }

  const user = await User.findById(
    decoded.userId
  );

  if (!user) {
    return {
      error: "User not found.",
      status: 404,
    };
  }

  if (user.role !== "business") {
    return {
      error:
        "Only business users can use this tool.",
      status: 403,
    };
  }

  if (!user.onboardingCompleted) {
    return {
      error:
        "Please complete business onboarding first.",
      status: 403,
    };
  }

  const now = new Date();

  const trialEndsAt = user.trialEndsAt
    ? new Date(user.trialEndsAt)
    : null;

  const trialExpired =
    !user.planSelected &&
    trialEndsAt &&
    now >= trialEndsAt;

  if (trialExpired) {
    return {
      error:
        "Your free trial has expired. Please select a plan first.",
      status: 403,
      upgradeRequired: true,
    };
  }

  return {
    user,
  };
};

export async function POST(request) {
  try {
    await connectDB();

    /*
     * Authenticate business user
     */
    const auth =
      await getAuthenticatedBusiness();

    if (auth.error) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error,
          upgradeRequired:
            Boolean(
              auth.upgradeRequired
            ),
        },
        {
          status: auth.status,
        }
      );
    }

    const user = auth.user;

    /*
     * Read request body
     */
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please send valid JSON data.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Clean form values
     */
    const topic = String(
      body.topic || ""
    )
      .trim()
      .slice(0, 250);

    const platform = String(
      body.platform || "instagram"
    )
      .trim()
      .toLowerCase();

    const postType = String(
      body.postType || "promotional"
    )
      .trim()
      .toLowerCase();

    const tone = String(
      body.tone || "professional"
    )
      .trim()
      .slice(0, 100);

    const offer = String(
      body.offer || ""
    )
      .trim()
      .slice(0, 300);

    const customCTA = String(
      body.cta || ""
    )
      .trim()
      .slice(0, 250);

    /*
     * Validate input
     */
    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Post topic is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !allowedPlatforms.includes(
        platform
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid post platform.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !allowedPostTypes.includes(
        postType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid post type.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Free Plan restrictions
     *
     * Trial users and users with the
     * Free Plan receive 3 posts per day.
     */
    const isFreeAccess =
      !user.planSelected ||
      user.plan === "free";

    let generatedToday = 0;

    if (isFreeAccess) {
      const {
        startOfDay,
        endOfDay,
      } = getIndiaDayRange();

      generatedToday =
        await GeneratedContent.countDocuments(
          {
            user: user._id,
            type: "business-post",

            createdAt: {
              $gte: startOfDay,
              $lt: endOfDay,
            },
          }
        );

      if (
        generatedToday >=
        FREE_DAILY_POST_LIMIT
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "You have used all 3 Free Plan business-post generations for today. Upgrade to Business Pro for unlimited generations.",

            upgradeRequired: true,

            limit: FREE_DAILY_POST_LIMIT,

            used: generatedToday,

            remaining: 0,
          },
          {
            status: 403,
          }
        );
      }
    }

    /*
     * Load business profile
     */
    const businessProfile =
      await BusinessProfile.findOne({
        user: user._id,
      }).lean();

    if (!businessProfile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const services = Array.isArray(
      businessProfile.services
    )
      ? businessProfile.services
          .filter(Boolean)
          .join(", ")
      : businessProfile.services || "";

    const businessGoal =
      businessProfile.goal ||
      businessProfile.primaryGoal ||
      "Grow the business";

    const onlinePresence =
      businessProfile.onlinePresence ||
      businessProfile
        .currentOnlinePresence ||
      "Not provided";

    const targetCustomers =
      businessProfile.targetCustomers ||
      "Local customers";

    /*
     * Gemini prompt
     */
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

    /*
     * Generate AI post
     */
    let output;

    try {
      const interaction =
        await gemini.interactions.create({
          model: "gemini-3.5-flash",
          input: prompt,
        });

      output =
        interaction.output_text?.trim();

      if (!output) {
        return NextResponse.json(
          {
            success: false,
            message:
              "AI did not return a business post.",
          },
          {
            status: 502,
          }
        );
      }
    } catch (aiError) {
      console.error(
        "Business post AI error:",
        aiError
      );

      if (
        aiError?.status === 429 ||
        aiError?.statusCode === 429 ||
        aiError?.code === 429
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "AI request limit reached. Please wait a few minutes and try again.",
          },
          {
            status: 429,
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "AI could not generate the business post. Please try again.",

          error:
            process.env.NODE_ENV ===
            "development"
              ? aiError.message
              : undefined,
        },
        {
          status: 503,
        }
      );
    }

    /*
     * Save generated content
     */
    const generatedContent =
      await GeneratedContent.create({
        user: user._id,
        type: "business-post",
        prompt,
        output,
      });

    const remainingFreePosts =
      isFreeAccess
        ? Math.max(
            0,
            FREE_DAILY_POST_LIMIT -
              generatedToday -
              1
          )
        : null;

    return NextResponse.json(
      {
        success: true,

        message:
          "Business post generated successfully.",

        data: {
          id:
            generatedContent._id.toString(),

          type: generatedContent.type,

          topic,

          platform,

          postType,

          tone,

          output,

          plan:
            user.plan || "free",

          dailyLimit: isFreeAccess
            ? FREE_DAILY_POST_LIMIT
            : null,

          usedToday: isFreeAccess
            ? generatedToday + 1
            : null,

          remainingFreePosts,

          createdAt:
            generatedContent.createdAt,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Business post generator error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to generate business post.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}