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

function cleanOutput(output = "") {
  return output
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function normalizeReply(output = "") {
  const cleaned = cleanOutput(output);

  try {
    const parsed = JSON.parse(cleaned);

    return {
      reply: String(parsed.reply || "").trim(),
      alternativeReply: String(
        parsed.alternativeReply || ""
      ).trim(),
      followUpMessage: String(
        parsed.followUpMessage || ""
      ).trim(),
    };
  } catch {
    return {
      reply: cleaned,
      alternativeReply: "",
      followUpMessage: "",
    };
  }
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
      customerMessage = "",
      tone = "Professional",
      language = "Hinglish",
      length = "Medium",
      includeCta = true,
      cta = "",
      additionalContext = "",
    } = body;

    if (!customerMessage.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer message is required.",
        },
        {
          status: 400,
        }
      );
    }

    const profile = await BusinessProfile.findOne({
      user: auth.user._id,
    }).lean();

    const businessName =
      profile?.businessName || "Our Business";

    const businessType =
      profile?.businessType || "Business";

    const finalCta =
      cta.trim() ||
      "Please share more details so we can assist you.";

    const prompt = `
You are Trendora, an expert WhatsApp customer support and sales assistant.

Generate a professional WhatsApp reply for a business customer.

Business name: ${businessName}
Business type: ${businessType}

Customer message:
${customerMessage.trim()}

Reply tone: ${tone}
Language: ${language}
Reply length: ${length}
Include call to action: ${includeCta ? "Yes" : "No"}
Preferred call to action: ${includeCta ? finalCta : "Do not include CTA"}
Additional business context: ${
      additionalContext.trim() || "Not provided"
    }

Generate:
1. Main WhatsApp reply
2. Alternative reply
3. Follow-up message

Rules:
- Reply directly to the customer's message.
- Be polite, natural and helpful.
- Do not sound robotic.
- Do not invent prices, availability, discounts, delivery dates or guarantees.
- If exact information is missing, ask the customer for the required details.
- Use short WhatsApp-friendly paragraphs.
- Do not overuse emojis.
- Use maximum 2 relevant emojis.
- Do not use markdown headings inside the replies.
- Match the requested language.
- For Hinglish, use simple Roman Hindi mixed with English.
- Return valid JSON only.
- Do not add markdown or explanation.

Return exactly:

{
  "reply": "Main reply",
  "alternativeReply": "Alternative reply",
  "followUpMessage": "Follow-up reply"
}
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
          message: "AI did not generate a reply.",
        },
        {
          status: 503,
        }
      );
    }

    const generatedReply = normalizeReply(output);

    if (!generatedReply.reply) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AI returned an incomplete reply. Please try again.",
        },
        {
          status: 503,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "WhatsApp reply generated successfully.",
        data: {
          generatedReply,
          input: {
            customerMessage: customerMessage.trim(),
            tone,
            language,
            length,
            includeCta,
            cta: finalCta,
            additionalContext: additionalContext.trim(),
          },
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Business WhatsApp reply error:",
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
        message: "Unable to generate WhatsApp reply.",
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