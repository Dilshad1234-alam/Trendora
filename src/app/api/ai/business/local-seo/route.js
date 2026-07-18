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

function cleanJsonOutput(output = "") {
  return output
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function normalizeSeoOutput(output = "") {
  const cleaned = cleanJsonOutput(output);

  try {
    const parsed = JSON.parse(cleaned);

    return {
      googleBusinessDescription: String(
        parsed.googleBusinessDescription || ""
      ).trim(),

      metaTitle: String(
        parsed.metaTitle || ""
      ).trim(),

      metaDescription: String(
        parsed.metaDescription || ""
      ).trim(),

      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.map((item) =>
            String(item).trim()
          )
        : [],

      faqs: Array.isArray(parsed.faqs)
        ? parsed.faqs.map((item) => ({
            question: String(
              item.question || ""
            ).trim(),
            answer: String(
              item.answer || ""
            ).trim(),
          }))
        : [],

      localSeoTips: Array.isArray(
        parsed.localSeoTips
      )
        ? parsed.localSeoTips.map((item) =>
            String(item).trim()
          )
        : [],
    };
  } catch {
    return null;
  }
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
      businessName = "",
      businessType = "",
      city = "",
      services = "",
      targetKeyword = "",
      audience = "",
    } = body;

    if (!targetKeyword.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Target keyword is required.",
        },
        {
          status: 400,
        }
      );
    }

    const profile =
      await BusinessProfile.findOne({
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

    const finalBusinessName =
      businessName.trim() ||
      profile.businessName ||
      "Local Business";

    const finalBusinessType =
      businessType.trim() ||
      profile.businessType ||
      "Business";

    const finalCity =
      city.trim() ||
      profile.city ||
      "Local Area";

    const profileServices =
      Array.isArray(profile.services)
        ? profile.services.join(", ")
        : profile.services || "";

    const finalServices =
      services.trim() ||
      profileServices ||
      "General services";

    const finalAudience =
      audience.trim() ||
      profile.targetCustomers ||
      "Local customers";

    const prompt = `
You are Trendora, an expert local SEO strategist.

Create local SEO content for a real business.

Business details:
Business name: ${finalBusinessName}
Business type: ${finalBusinessType}
City: ${finalCity}
Services: ${finalServices}
Target audience: ${finalAudience}
Primary target keyword: ${targetKeyword.trim()}

Create:

1. Google Business Profile description
2. SEO meta title
3. SEO meta description
4. 10 relevant SEO keywords
5. 5 customer-focused FAQs with short answers
6. 6 practical local SEO tips

Rules:
- Use the target keyword naturally.
- Mention the city naturally.
- Do not keyword-stuff.
- Do not invent prices, awards, ratings, years of experience or guarantees.
- Google Business description should be clear and professional.
- Meta title should ideally stay under 60 characters.
- Meta description should ideally stay under 160 characters.
- Keywords must be relevant to the business and city.
- FAQs must be useful to real customers.
- Return valid JSON only.
- Do not add markdown.
- Do not add text before or after JSON.

Return exactly this structure:

{
  "googleBusinessDescription": "Business description",
  "metaTitle": "SEO title",
  "metaDescription": "SEO description",
  "keywords": [
    "keyword 1",
    "keyword 2"
  ],
  "faqs": [
    {
      "question": "Question",
      "answer": "Answer"
    }
  ],
  "localSeoTips": [
    "Tip 1",
    "Tip 2"
  ]
}
`;

    const interaction =
      await gemini.interactions.create({
        model: "gemini-3.5-flash",
        input: prompt,
      });

    const output =
      interaction.output_text?.trim();

    if (!output) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AI did not generate local SEO content.",
        },
        {
          status: 503,
        }
      );
    }

    const seoContent =
      normalizeSeoOutput(output);

    if (
      !seoContent ||
      !seoContent.googleBusinessDescription ||
      !seoContent.metaTitle ||
      !seoContent.metaDescription
    ) {
      console.error(
        "Invalid Local SEO AI output:",
        output
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "AI returned incomplete SEO content. Please try again.",
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
          "Local SEO content generated successfully.",
        data: {
          seoContent,
          input: {
            businessName:
              finalBusinessName,
            businessType:
              finalBusinessType,
            city: finalCity,
            services: finalServices,
            targetKeyword:
              targetKeyword.trim(),
            audience: finalAudience,
          },
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Business local SEO error:",
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
          "Unable to generate local SEO content.",
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