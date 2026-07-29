import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import GeneratedContent from "@/models/GeneratedContent";

const FREE_DAILY_WHATSAPP_REPLY_LIMIT = 3;

function getIndiaDayRange() {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  const indiaNow = new Date(now.getTime() + IST_OFFSET_MS);

  const startOfDayUTC = Date.UTC(
    indiaNow.getUTCFullYear(),
    indiaNow.getUTCMonth(),
    indiaNow.getUTCDate()
  );

  const startOfDay = new Date(startOfDayUTC - IST_OFFSET_MS);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

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

  const user = await User.findById(userId);

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
  const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const trialExpired = !user.planSelected && trialEndsAt && now >= trialEndsAt;

  if (trialExpired) {
    return {
      error: "Your free trial has expired. Please select a plan first.",
      status: 403,
      upgradeRequired: true,
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
      alternativeReply: String(parsed.alternativeReply || "").trim(),
      followUpMessage: String(parsed.followUpMessage || parsed.followUp || parsed.followUp_message || "").trim(),
    };
  } catch {
    return {
      reply: cleaned,
      alternativeReply: "",
      followUpMessage: "",
    };
  }
}

function formatWhatsAppReply({
  customerMessage,
  tone,
  language,
  length,
  includeCta,
  cta,
  additionalContext,
  generatedReply,
}) {
  return [
    `Customer Message:\n${customerMessage}`,
    `Reply Tone:\n${tone}`,
    `Language:\n${language}`,
    `Reply Length:\n${length}`,
    includeCta ? `Call To Action:\n${cta}` : "",
    additionalContext ? `Additional Context:\n${additionalContext}` : "",
    `Main WhatsApp Reply:\n${generatedReply.reply}`,
    generatedReply.alternativeReply
      ? `Alternative Reply:\n${generatedReply.alternativeReply}`
      : "",
    generatedReply.followUpMessage
      ? `Follow-up Message:\n${generatedReply.followUpMessage}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
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
          upgradeRequired: Boolean(auth.upgradeRequired),
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

    const customerMessage = String(body.customerMessage || "").trim();
    const tone = String(body.tone || "Professional").trim();
    const language = String(body.language || "Hinglish").trim();
    const length = String(body.length || "Medium").trim();
    const includeCta = body.includeCta !== false;
    const cta = String(body.cta || "").trim();
    const additionalContext = String(body.additionalContext || "").trim();

    if (!customerMessage) {
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

    const isFreeAccess = !user.planSelected || user.plan === "free";
    let generatedToday = 0;

    if (isFreeAccess) {
      const { startOfDay, endOfDay } = getIndiaDayRange();

      generatedToday = await GeneratedContent.countDocuments({
        user: user._id,
        type: "whatsapp-reply",
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      });

      if (generatedToday >= FREE_DAILY_WHATSAPP_REPLY_LIMIT) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You have used all 3 free whatsapp-reply generations for today. Upgrade to Business Pro for unlimited generations.",
            upgradeRequired: true,
            dailyLimit: FREE_DAILY_WHATSAPP_REPLY_LIMIT,
            usedToday: generatedToday,
            remainingFreeWhatsAppReplies: 0,
          },
          {
            status: 403,
          }
        );
      }
    }

    const profile = await BusinessProfile.findOne({
      user: user._id,
    }).lean();

    const businessName = profile?.businessName || "Our Business";
    const businessType = profile?.businessType || "Business";
    const finalCta = cta || "Please share more details so we can assist you.";

    const prompt = `
You are Trendora, an expert WhatsApp customer support and sales assistant.

Generate a professional WhatsApp reply for a business customer.

Business name: ${businessName}
Business type: ${businessType}

Customer message:
${customerMessage}

Reply tone: ${tone}
Language: ${language}
Reply length: ${length}
Include call to action: ${includeCta ? "Yes" : "No"}
Preferred call to action: ${includeCta ? finalCta : "Do not include CTA"}
Additional business context: ${additionalContext || "Not provided"}

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

    let output;
    try {
      const interaction = await gemini.interactions.create({
        model: "gemini-3.6-flash",
        input: prompt,
      });

      output = interaction.output_text?.trim();
    } catch (aiError) {
      console.error("Business WhatsApp reply AI error:", aiError);

      if (
        aiError?.status === 429 ||
        aiError?.statusCode === 429 ||
        aiError?.code === 429
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "AI request limit reached. Please wait a few minutes and try again.",
          },
          {
            status: 429,
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "AI could not generate the WhatsApp reply. Please try again.",
          error: process.env.NODE_ENV === "development" ? aiError?.message : undefined,
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
          message: "AI returned an incomplete reply. Please try again.",
        },
        {
          status: 503,
        }
      );
    }

    const formattedReply = formatWhatsAppReply({
      customerMessage,
      tone,
      language,
      length,
      includeCta,
      cta: finalCta,
      additionalContext,
      generatedReply,
    });

    const generatedContent = await GeneratedContent.create({
      user: user._id,
      type: "whatsapp-reply",
      prompt,
      output: formattedReply,
    });

    const remainingFreeWhatsAppReplies = isFreeAccess
      ? Math.max(0, FREE_DAILY_WHATSAPP_REPLY_LIMIT - generatedToday - 1)
      : null;

    return NextResponse.json(
      {
        success: true,
        message: "WhatsApp reply generated successfully.",
        data: {
          id: generatedContent._id.toString(),
          generatedReply,
          formattedReply,
          input: {
            customerMessage,
            tone,
            language,
            length,
            includeCta,
            cta: finalCta,
            additionalContext,
          },
          plan: user.plan || "free",
          dailyLimit: isFreeAccess ? FREE_DAILY_WHATSAPP_REPLY_LIMIT : null,
          usedToday: isFreeAccess ? generatedToday + 1 : null,
          remainingFreeWhatsAppReplies,
          createdAt: generatedContent.createdAt,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Business WhatsApp reply error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate WhatsApp reply.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      }
    );
  }
}