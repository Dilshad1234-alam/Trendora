import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import GeneratedContent from "@/models/GeneratedContent";

const FREE_DAILY_HASHTAG_LIMIT = 3;

const ALLOWED_PLATFORMS = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "YouTube",
];

const ALLOWED_COUNTS = [10, 15, 20, 30];

function getIndiaDayRange() {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

  const now = new Date();
  const indiaNow = new Date(now.getTime() + IST_OFFSET_MS);

  const startOfDayUTC = Date.UTC(
    indiaNow.getUTCFullYear(),
    indiaNow.getUTCMonth(),
    indiaNow.getUTCDate()
  );

  const startOfDay = new Date(
    startOfDayUTC - IST_OFFSET_MS
  );

  const endOfDay = new Date(
    startOfDay.getTime() + 24 * 60 * 60 * 1000
  );

  return {
    startOfDay,
    endOfDay,
  };
}

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
          upgradeRequired: Boolean(
            auth.upgradeRequired
          ),
        },
        {
          status: auth.status,
        }
      );
    }

    const user = auth.user;

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

    const topic = String(body.topic || "")
      .trim()
      .slice(0, 300);

    const city = String(body.city || "")
      .trim()
      .slice(0, 100);

    const platform = String(
      body.platform || "Instagram"
    ).trim();

    const requestedCount = Number(body.count) || 20;

    if (!topic) {
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

    if (!ALLOWED_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid social-media platform.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED_COUNTS.includes(requestedCount)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid hashtag count.",
        },
        {
          status: 400,
        }
      );
    }

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
        await GeneratedContent.countDocuments({
          user: user._id,
          type: "business-hashtag",
          createdAt: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        });

      if (
        generatedToday >=
        FREE_DAILY_HASHTAG_LIMIT
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You have used all 3 Free Plan hashtag generations for today. Upgrade to Business Pro for unlimited generations.",
            upgradeRequired: true,
            dailyLimit: FREE_DAILY_HASHTAG_LIMIT,
            usedToday: generatedToday,
            remainingFreeHashtags: 0,
          },
          {
            status: 403,
          }
        );
      }
    }

    const profile =
      await BusinessProfile.findOne({
        user: user._id,
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
      city || profile.city || "";

    const services = Array.isArray(
      profile.services
    )
      ? profile.services
          .filter(Boolean)
          .join(", ")
      : profile.services || "Not provided";

    const prompt = `
You are Trendora, an expert social-media hashtag strategist for local businesses.

Generate exactly ${requestedCount} high-quality hashtags.

BUSINESS DETAILS

Business name:
${profile.businessName || "Local business"}

Business type:
${profile.businessType || "Business"}

Business city:
${businessCity || "Not provided"}

Business services:
${services}

Target customers:
${profile.targetCustomers || "Local customers"}

Business goal:
${profile.goal || "Grow the business"}

HASHTAG REQUEST

Topic:
${topic}

Platform:
${platform}

Number of hashtags:
${requestedCount}

RULES

- Return exactly ${requestedCount} unique hashtags.
- Every hashtag must start with #.
- Return hashtags separated only by spaces.
- Do not add headings, explanations or numbering.
- Do not use markdown formatting.
- Include a balanced mix of:
  - niche hashtags
  - industry hashtags
  - customer-intent hashtags
  - local hashtags
  - platform-relevant hashtags
- Use the city naturally in some hashtags when available.
- Do not invent business information.
- Do not use unrelated trending hashtags.
- Do not use spam hashtags.
- Avoid duplicate or nearly identical hashtags.
- Keep every hashtag readable.
`;

    let rawOutput;

    try {
      const interaction =
        await gemini.interactions.create({
          model: "gemini-3.5-flash",
          input: prompt,
        });

      rawOutput =
        interaction.output_text?.trim();

      if (!rawOutput) {
        return NextResponse.json(
          {
            success: false,
            message:
              "AI did not generate hashtags.",
          },
          {
            status: 502,
          }
        );
      }
    } catch (aiError) {
      console.error(
        "Business hashtag AI error:",
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
            "AI could not generate business hashtags. Please try again.",
          error:
            process.env.NODE_ENV === "development"
              ? aiError?.message
              : undefined,
        },
        {
          status: 503,
        }
      );
    }

    const hashtagArray = [
      ...new Set(
        rawOutput
          .replaceAll("\n", " ")
          .split(/\s+/)
          .map((tag) => {
            const cleanedTag = tag
              .trim()
              .replace(/[.,;:!?]+$/g, "");

            if (!cleanedTag) {
              return "";
            }

            return cleanedTag.startsWith("#")
              ? cleanedTag
              : `#${cleanedTag}`;
          })
          .filter(
            (tag) =>
              tag.length > 1 &&
              /^#[\p{L}\p{N}_]+$/u.test(tag)
          )
      ),
    ].slice(0, requestedCount);

    if (hashtagArray.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AI returned invalid hashtags. Please try again.",
        },
        {
          status: 502,
        }
      );
    }

    const hashtags = hashtagArray.join(" ");

    const generatedContent =
      await GeneratedContent.create({
        user: user._id,
        type: "business-hashtag",
        prompt,
        output: hashtags,
      });

    const remainingFreeHashtags =
      isFreeAccess
        ? Math.max(
            0,
            FREE_DAILY_HASHTAG_LIMIT -
              generatedToday -
              1
          )
        : null;

    return NextResponse.json(
      {
        success: true,
        message:
          "Business hashtags generated successfully.",
        data: {
          id: generatedContent._id.toString(),
          type: generatedContent.type,
          hashtags,
          topic,
          city: businessCity,
          platform,
          count: hashtagArray.length,
          plan: user.plan || "free",
          dailyLimit: isFreeAccess
            ? FREE_DAILY_HASHTAG_LIMIT
            : null,
          usedToday: isFreeAccess
            ? generatedToday + 1
            : null,
          remainingFreeHashtags,
          createdAt: generatedContent.createdAt,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Business hashtag generator error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to generate business hashtags.",
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