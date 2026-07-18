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
      error: "Unauthorized. Please login first.",
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

function normalizeAdCopy(output = "") {
  const cleanedOutput = output
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanedOutput);

    return {
      headline: String(parsed.headline || "").trim(),
      primaryText: String(
        parsed.primaryText || parsed.primary_text || ""
      ).trim(),
      description: String(parsed.description || "").trim(),
      cta: String(parsed.cta || "").trim(),
    };
  } catch {
    const sections = {
      headline: "",
      primaryText: "",
      description: "",
      cta: "",
    };

    const lines = cleanedOutput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let currentSection = "";

    for (const line of lines) {
      const normalizedLine = line
        .replace(/\*\*/g, "")
        .replace(/:$/, "")
        .toLowerCase();

      if (normalizedLine === "headline") {
        currentSection = "headline";
        continue;
      }

      if (
        normalizedLine === "primary text" ||
        normalizedLine === "primarytext"
      ) {
        currentSection = "primaryText";
        continue;
      }

      if (normalizedLine === "description") {
        currentSection = "description";
        continue;
      }

      if (normalizedLine === "cta") {
        currentSection = "cta";
        continue;
      }

      if (currentSection) {
        sections[currentSection] = sections[currentSection]
          ? `${sections[currentSection]}\n${line}`
          : line;
      }
    }

    return sections;
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
      goal = "Lead Generation",
      product,
      audience,
      platform = "Facebook",
      tone = "Professional",
      cta = "Contact Us",
      offer = "",
    } = body;

    if (!product?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Product or service is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!audience?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Target audience is required.",
        },
        {
          status: 400,
        }
      );
    }

    const profile = await BusinessProfile.findOne({
      user: auth.user._id,
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

    const businessName =
      profile.businessName || "Local Business";

    const businessType =
      profile.businessType || "Business";

    const city = profile.city || "Local Area";

    const services = Array.isArray(profile.services)
      ? profile.services.join(", ")
      : profile.services || "";

    const prompt = `
You are Trendora, an expert performance marketing copywriter.

Create one high-converting advertisement for a real business.

Business details:
Business name: ${businessName}
Business type: ${businessType}
City: ${city}
Services: ${services || "Not provided"}
Business goal: ${profile.goal || "Grow the business"}

Advertisement request:
Campaign goal: ${goal}
Product or service: ${product.trim()}
Target audience: ${audience.trim()}
Advertising platform: ${platform}
Tone: ${tone}
Call to action: ${cta}
Offer: ${offer.trim() || "No special offer provided"}

Rules:
- Make the ad suitable for ${platform}.
- Use a strong benefit-focused headline.
- Primary text should clearly explain the customer problem and the business solution.
- Keep the writing persuasive but truthful.
- Use the business city naturally when useful.
- Do not invent prices, discounts, guarantees, awards, customer numbers or statistics.
- Mention the offer only when an offer was provided.
- Avoid excessive emojis.
- Do not use hashtags.
- Do not use markdown.
- Return valid JSON only.
- Do not add any text before or after the JSON.

Return exactly this JSON structure:

{
  "headline": "A short, strong ad headline",
  "primaryText": "The main advertisement text",
  "description": "A short supporting description",
  "cta": "${cta}"
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
          message: "AI did not generate ad copy.",
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
      console.error(
        "Invalid ad-copy AI output:",
        output
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "AI returned an incomplete ad copy. Please try again.",
        },
        {
          status: 503,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ad copy generated successfully.",
        data: {
          adCopy,
          input: {
            goal,
            product: product.trim(),
            audience: audience.trim(),
            platform,
            tone,
            cta,
            offer: offer.trim(),
          },
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Business ad-copy error:",
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
          "Unable to generate business ad copy.",
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