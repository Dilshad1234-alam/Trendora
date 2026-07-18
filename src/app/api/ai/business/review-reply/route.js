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

  const userId =
    decoded?.userId ||
    decoded?.id ||
    decoded?._id;

  if (!userId) {
    return {
      error: "Invalid authentication token.",
      status: 401,
    };
  }

  const user = await User.findById(userId).lean();

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

function cleanAiOutput(output = "") {
  return output
    .replace(/```json/gi, "")
    .replace(/```javascript/gi, "")
    .replace(/```/g, "")
    .trim();
}

function normalizeReviewReply(output = "") {
  const cleanedOutput = cleanAiOutput(output);

  try {
    const parsed = JSON.parse(cleanedOutput);

    return {
      reply: String(parsed.reply || "").trim(),
      alternativeReply: String(
        parsed.alternativeReply || ""
      ).trim(),
      privateFollowUp: String(
        parsed.privateFollowUp || ""
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
  const numericRating = Number(rating);

  return (
    Number.isInteger(numericRating) &&
    numericRating >= 1 &&
    numericRating <= 5
  );
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
      platform = "Google",
      rating = 5,
      customerName = "",
      review = "",
      tone = "Professional",
      language = "English",
      length = "Medium",
      includeBusinessName = true,
      additionalContext = "",
    } = body;

    if (!review.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer review is required.",
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
          message: "Rating must be between 1 and 5.",
        },
        {
          status: 400,
        }
      );
    }

    const businessProfile =
      await BusinessProfile.findOne({
        user: auth.user._id,
      }).lean();

    const businessName =
      businessProfile?.businessName ||
      businessProfile?.brandName ||
      "Our Business";

    const businessType =
      businessProfile?.businessType ||
      businessProfile?.category ||
      "Business";

    const location =
      businessProfile?.city ||
      businessProfile?.location ||
      "Not provided";

    const customerReference = customerName.trim()
      ? customerName.trim()
      : "Customer";

    const prompt = `
You are Trendora, an expert online reputation management assistant.

Write a professional business response to a customer review.

BUSINESS DETAILS:
Business name: ${
      includeBusinessName
        ? businessName
        : "Do not mention the business name"
    }
Business type: ${businessType}
Business location: ${location}

REVIEW DETAILS:
Platform: ${platform}
Customer name: ${customerReference}
Rating: ${Number(rating)} out of 5 stars

Customer review:
${review.trim()}

RESPONSE SETTINGS:
Tone: ${tone}
Language: ${language}
Reply length: ${length}
Additional context: ${
      additionalContext.trim() || "Not provided"
    }

Generate the following:

1. A main public review reply.
2. An alternative public reply.
3. A short private follow-up message that the business can send directly to the customer.

IMPORTANT RULES:
- Reply directly to the customer's feedback.
- Keep the reply natural, respectful and human.
- Do not sound robotic or overly promotional.
- Do not invent order details, refunds, discounts, policies or resolutions.
- Do not admit legal liability.
- Do not reveal private customer information.
- Never argue with or blame the customer.
- Match the requested language.
- For Hinglish, use simple Roman Hindi mixed naturally with English.
- Use short paragraphs suitable for review platforms.
- Do not use markdown headings inside the generated replies.
- Do not use more than 2 emojis.
- For 1 or 2 star reviews, apologize and invite the customer to continue the conversation privately.
- For 3 star reviews, acknowledge both positive and negative feedback.
- For 4 or 5 star reviews, thank the customer warmly without exaggeration.
- Mention the business name only when requested.
- Return valid JSON only.
- Do not add markdown fences or explanations.

Return exactly this JSON structure:

{
  "reply": "Main public review reply",
  "alternativeReply": "Alternative public reply",
  "privateFollowUp": "Private follow-up message"
}
`;

    const interaction =
      await gemini.interactions.create({
        model: "gemini-3.5-flash",
        input: prompt,
      });

    const output =
      interaction?.output_text?.trim();

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
      return NextResponse.json(
        {
          success: false,
          message:
            "AI returned an incomplete response. Please try again.",
        },
        {
          status: 503,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Review reply generated successfully.",
        data: {
          generatedReply,
          input: {
            platform,
            rating: Number(rating),
            customerName: customerName.trim(),
            review: review.trim(),
            tone,
            language,
            length,
            includeBusinessName,
            additionalContext:
              additionalContext.trim(),
          },
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Business review reply error:",
      error
    );

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