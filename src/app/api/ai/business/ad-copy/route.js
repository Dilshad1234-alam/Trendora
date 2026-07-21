import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import GeneratedContent from "@/models/GeneratedContent";

const FREE_DAILY_AD_COPY_LIMIT = 3;

const ALLOWED_PLATFORMS = [
  "Facebook Ads",
  "Instagram Ads",
  "Google Ads",
  "LinkedIn Ads",
];

const ALLOWED_OBJECTIVES = [
  "Generate Leads",
  "Increase Sales",
  "Website Traffic",
  "Brand Awareness",
  "Get Messages",
  "Promote Offer",
];

const ALLOWED_TONES = [
  "Professional",
  "Friendly",
  "Persuasive",
  "Urgent",
  "Luxury",
  "Emotional",
];

const ALLOWED_CTAS = [
  "Learn More",
  "Contact Us",
  "Book Now",
  "Shop Now",
  "Call Now",
  "Send Message",
  "Get Offer",
];

function getIndiaDayRange() {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

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

function normalizeAdCopy(output = "") {
  const cleanedOutput = output
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanedOutput);

    return {
      headline: String(
        parsed.headline || ""
      ).trim(),

      primaryText: String(
        parsed.primaryText ||
          parsed.primary_text ||
          ""
      ).trim(),

      description: String(
        parsed.description || ""
      ).trim(),

      cta: String(parsed.cta || "").trim(),
    };
  } catch {
    return {
      headline: "",
      primaryText: cleanedOutput,
      description: "",
      cta: "",
    };
  }
}

function formatAdCopy(adCopy) {
  return [
    `Headline:\n${adCopy.headline}`,
    `Primary Text:\n${adCopy.primaryText}`,
    `Description:\n${adCopy.description}`,
    `CTA:\n${adCopy.cta}`,
  ]
    .filter((section) => {
      const value = section
        .split("\n")
        .slice(1)
        .join("\n")
        .trim();

      return Boolean(value);
    })
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

    const platform = String(
      body.platform || "Facebook Ads"
    ).trim();

    const objective = String(
      body.objective || "Generate Leads"
    ).trim();

    const tone = String(
      body.tone || "Professional"
    ).trim();

    const cta = String(
      body.cta || "Learn More"
    ).trim();

    const offer = String(body.offer || "")
      .trim()
      .slice(0, 200);

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Advertisement topic is required.",
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
          message:
            "Invalid advertising platform.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED_OBJECTIVES.includes(objective)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid campaign objective.",
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
          message: "Invalid ad-copy tone.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED_CTAS.includes(cta)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid call-to-action value.",
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
      const { startOfDay, endOfDay } =
        getIndiaDayRange();

      generatedToday =
        await GeneratedContent.countDocuments({
          user: user._id,

          // Must match GeneratedContent enum
          type: "ad-copy",

          createdAt: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        });

      if (
        generatedToday >=
        FREE_DAILY_AD_COPY_LIMIT
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You have used all 3 free ad-copy generations for today.",

            upgradeRequired: true,
            dailyLimit:
              FREE_DAILY_AD_COPY_LIMIT,
            usedToday: generatedToday,
            remainingFreeAdCopies: 0,
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
          message:
            "Business profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const services = Array.isArray(
      profile.services
    )
      ? profile.services
          .filter(Boolean)
          .join(", ")
      : profile.services || "Not provided";

    const audience =
      profile.targetAudience ||
      profile.targetCustomers ||
      profile.audience ||
      "Potential customers";

    const prompt = `
You are Trendora, an expert performance marketing copywriter.

Create one high-converting advertisement for a real business.

Business name:
${profile.businessName || "Local Business"}

Business type:
${profile.businessType || "Business"}

City:
${profile.city || "Not provided"}

Services:
${services}

Target audience:
${audience}

Business goal:
${profile.goal || "Grow the business"}

Advertisement topic:
${topic}

Advertising platform:
${platform}

Campaign objective:
${objective}

Tone:
${tone}

Call to action:
${cta}

Offer:
${offer || "No special offer provided"}

Rules:
- Make the advertisement suitable for ${platform}.
- Write a strong benefit-focused headline.
- Explain the customer problem and business solution.
- Match the "${tone}" tone.
- Support the "${objective}" objective.
- Do not invent prices, statistics, discounts or guarantees.
- Do not use hashtags.
- Do not use markdown.
- Return valid JSON only.

Return exactly:

{
  "headline": "Strong ad headline",
  "primaryText": "Main advertisement copy",
  "description": "Short supporting description",
  "cta": "${cta}"
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
        interaction.output_text?.trim();
    } catch (aiError) {
      console.error(
        "Business ad-copy AI error:",
        aiError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            aiError?.status === 429
              ? "AI request limit reached. Please try again later."
              : "AI could not generate the advertisement.",
        },
        {
          status:
            aiError?.status === 429
              ? 429
              : 503,
        }
      );
    }

    if (!output) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AI did not generate ad copy.",
        },
        {
          status: 503,
        }
      );
    }

    const adCopy = normalizeAdCopy(output);

    if (
      !adCopy.headline ||
      !adCopy.primaryText
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AI returned incomplete ad copy.",
        },
        {
          status: 503,
        }
      );
    }

    if (!adCopy.cta) {
      adCopy.cta = cta;
    }

    const formattedAdCopy =
      formatAdCopy(adCopy);

    const generatedContent =
      await GeneratedContent.create({
        user: user._id,

        // Must match GeneratedContent enum
        type: "ad-copy",

        prompt,
        output: formattedAdCopy,
      });

    const remainingFreeAdCopies =
      isFreeAccess
        ? Math.max(
            0,
            FREE_DAILY_AD_COPY_LIMIT -
              generatedToday -
              1
          )
        : null;

    return NextResponse.json(
      {
        success: true,
        message:
          "Business ad copy generated successfully.",

        data: {
          id: generatedContent._id.toString(),
          adCopy: formattedAdCopy,
          adCopyParts: adCopy,
          topic,
          platform,
          objective,
          tone,
          cta,
          offer,
          plan: user.plan || "free",

          dailyLimit: isFreeAccess
            ? FREE_DAILY_AD_COPY_LIMIT
            : null,

          usedToday: isFreeAccess
            ? generatedToday + 1
            : null,

          remainingFreeAdCopies,

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
      "Business ad-copy generator error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to generate business ad copy.",

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