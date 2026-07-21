import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import GeneratedContent from "@/models/GeneratedContent";

const FREE_DAILY_REVIEW_REPLY_LIMIT = 3;

const ALLOWED_PLATFORMS = [
  "Google",
  "Facebook",
  "Instagram",
  "Amazon",
  "Flipkart",
  "Meesho",
  "Zomato",
  "Swiggy",
  "Tripadvisor",
  "Other",
];

const ALLOWED_TONES = [
  "Professional",
  "Friendly",
  "Apologetic",
  "Warm",
  "Premium",
  "Formal",
];

const ALLOWED_LANGUAGES = [
  "English",
  "Hindi",
  "Hinglish",
];

const ALLOWED_LENGTHS = [
  "Short",
  "Medium",
  "Detailed",
];

function getIndiaDayRange() {
  const IST_OFFSET_MS =
    5.5 * 60 * 60 * 1000;

  const now = new Date();

  const indiaNow = new Date(
    now.getTime() + IST_OFFSET_MS
  );

  const startOfDayUTC = Date.UTC(
    indiaNow.getUTCFullYear(),
    indiaNow.getUTCMonth(),
    indiaNow.getUTCDate()
  );

  const startOfDay = new Date(
    startOfDayUTC - IST_OFFSET_MS
  );

  const endOfDay = new Date(
    startOfDay.getTime() +
      24 * 60 * 60 * 1000
  );

  return {
    startOfDay,
    endOfDay,
  };
}

async function getAuthenticatedBusiness() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("token")?.value;

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

  const userId =
    decoded?.userId ||
    decoded?.id ||
    decoded?._id;

  if (!userId) {
    return {
      error:
        "Invalid authentication token.",
      status: 401,
    };
  }

  const user = await User.findById(userId);

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
        "Complete business onboarding first.",
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

function cleanAiOutput(output = "") {
  return output
    .replace(/```json/gi, "")
    .replace(/```javascript/gi, "")
    .replace(/```/g, "")
    .trim();
}

function normalizeReviewReply(output = "") {
  const cleanedOutput =
    cleanAiOutput(output);

  try {
    const parsed =
      JSON.parse(cleanedOutput);

    return {
      reply: String(
        parsed.reply || ""
      ).trim(),

      alternativeReply: String(
        parsed.alternativeReply ||
          parsed.alternative_reply ||
          ""
      ).trim(),

      privateFollowUp: String(
        parsed.privateFollowUp ||
          parsed.private_follow_up ||
          ""
      ).trim(),
    };
  } catch {
    return {
      reply: cleanedOutput,
      alternativeReply: "",
      privateFollowUp: "",
    };
  }
}

function validateRating(rating) {
  const numericRating =
    Number(rating);

  return (
    Number.isInteger(numericRating) &&
    numericRating >= 1 &&
    numericRating <= 5
  );
}

function formatReviewReply({
  platform,
  rating,
  customerName,
  review,
  generatedReply,
}) {
  return [
    `Platform:\n${platform}`,
    `Rating:\n${rating} out of 5 stars`,
    customerName
      ? `Customer Name:\n${customerName}`
      : "",
    `Customer Review:\n${review}`,
    `Main Public Reply:\n${generatedReply.reply}`,
    generatedReply.alternativeReply
      ? `Alternative Public Reply:\n${generatedReply.alternativeReply}`
      : "",
    generatedReply.privateFollowUp
      ? `Private Follow-up:\n${generatedReply.privateFollowUp}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(request) {
  try {
    await connectDB();

    const auth =
      await getAuthenticatedBusiness();

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
          message:
            "Please send valid JSON data.",
        },
        {
          status: 400,
        }
      );
    }

    const platform = String(
      body.platform || "Google"
    ).trim();

    const rating = Number(
      body.rating || 5
    );

    const customerName = String(
      body.customerName || ""
    )
      .trim()
      .slice(0, 100);

    const review = String(
      body.review || ""
    )
      .trim()
      .slice(0, 2000);

    const tone = String(
      body.tone || "Professional"
    ).trim();

    const language = String(
      body.language || "English"
    ).trim();

    const length = String(
      body.length || "Medium"
    ).trim();

    const includeBusinessName =
      body.includeBusinessName !== false;

    const additionalContext = String(
      body.additionalContext || ""
    )
      .trim()
      .slice(0, 1000);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer review is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!validateRating(rating)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Rating must be between 1 and 5.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !ALLOWED_PLATFORMS.includes(
        platform
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid review platform.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED_TONES.includes(tone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid review reply tone.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !ALLOWED_LANGUAGES.includes(
        language
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid review reply language.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !ALLOWED_LENGTHS.includes(
        length
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid review reply length.",
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
        await GeneratedContent.countDocuments(
          {
            user: user._id,
            type: "review-reply",

            createdAt: {
              $gte: startOfDay,
              $lt: endOfDay,
            },
          }
        );

      if (
        generatedToday >=
        FREE_DAILY_REVIEW_REPLY_LIMIT
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "You have used all 3 free review-reply generations for today. Upgrade to Business Pro for unlimited generations.",

            upgradeRequired: true,

            dailyLimit:
              FREE_DAILY_REVIEW_REPLY_LIMIT,

            usedToday: generatedToday,

            remainingFreeReviewReplies: 0,
          },
          {
            status: 403,
          }
        );
      }
    }

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

    const businessName =
      businessProfile.businessName ||
      businessProfile.brandName ||
      "Our Business";

    const businessType =
      businessProfile.businessType ||
      businessProfile.category ||
      "Business";

    const location =
      businessProfile.city ||
      businessProfile.location ||
      "Not provided";

    const customerReference =
      customerName || "Customer";

    const prompt = `
You are Trendora, an expert online reputation management assistant.

Write professional business responses to a customer review.

BUSINESS DETAILS

Business name:
${
  includeBusinessName
    ? businessName
    : "Do not mention the business name"
}

Business type:
${businessType}

Business location:
${location}

REVIEW DETAILS

Platform:
${platform}

Customer name:
${customerReference}

Rating:
${rating} out of 5 stars

Customer review:
${review}

RESPONSE SETTINGS

Tone:
${tone}

Language:
${language}

Reply length:
${length}

Additional context:
${additionalContext || "Not provided"}

TASK

Generate:

1. One main public review reply.
2. One alternative public review reply.
3. One short private follow-up message.

RULES

- Reply directly to the customer's feedback.
- Keep every reply natural, respectful and human.
- Do not sound robotic or excessively promotional.
- Do not invent order details, refunds, discounts, policies, guarantees or resolutions.
- Do not admit legal liability.
- Do not reveal private customer information.
- Never argue with or blame the customer.
- Match the requested language.
- For Hindi, use natural Hindi.
- For Hinglish, use simple Roman Hindi mixed naturally with English.
- Use short paragraphs suitable for review platforms.
- Do not use markdown headings inside the reply values.
- Do not use more than 2 emojis.
- For 1 or 2 star reviews, apologize and invite the customer to continue the conversation privately.
- For 3 star reviews, acknowledge both the positive and negative feedback.
- For 4 or 5 star reviews, thank the customer warmly without exaggeration.
- Mention the business name only when requested.
- Return valid JSON only.
- Do not add explanations or markdown fences.

Return exactly this JSON structure:

{
  "reply": "Main public review reply",
  "alternativeReply": "Alternative public reply",
  "privateFollowUp": "Private follow-up message"
}
`;

    let output;

    try {
      const interaction =
        await gemini.interactions.create({
          model: "gemini-3.5-flash",
          input: prompt,
        });

      output =
        interaction?.output_text?.trim();
    } catch (aiError) {
      console.error(
        "Business review-reply AI error:",
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
            "AI could not generate the review reply. Please try again.",

          error:
            process.env.NODE_ENV ===
            "development"
              ? aiError?.message
              : undefined,
        },
        {
          status: 503,
        }
      );
    }

    if (!output) {
      return NextResponse.json(
        {
          success: false,

          message:
            "AI did not generate a review reply.",
        },
        {
          status: 503,
        }
      );
    }

    const generatedReply =
      normalizeReviewReply(output);

    if (!generatedReply.reply) {
      console.error(
        "Invalid review-reply AI output:",
        output
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "AI returned an incomplete review reply. Please try again.",
        },
        {
          status: 503,
        }
      );
    }

    const formattedReply =
      formatReviewReply({
        platform,
        rating,
        customerName,
        review,
        generatedReply,
      });

    const generatedContent =
      await GeneratedContent.create({
        user: user._id,
        type: "review-reply",
        prompt,
        output: formattedReply,
      });

    const remainingFreeReviewReplies =
      isFreeAccess
        ? Math.max(
            0,
            FREE_DAILY_REVIEW_REPLY_LIMIT -
              generatedToday -
              1
          )
        : null;

    return NextResponse.json(
      {
        success: true,

        message:
          "Review reply generated successfully.",

        data: {
          id: generatedContent._id.toString(),

          generatedReply,

          formattedReply,

          input: {
            platform,
            rating,
            customerName,
            review,
            tone,
            language,
            length,
            includeBusinessName,
            additionalContext,
          },

          plan: user.plan || "free",

          dailyLimit: isFreeAccess
            ? FREE_DAILY_REVIEW_REPLY_LIMIT
            : null,

          usedToday: isFreeAccess
            ? generatedToday + 1
            : null,

          remainingFreeReviewReplies,

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
      "Business review-reply generator error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to generate review reply.",

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