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
      error: "Please select a plan first.",
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

function normalizeStringArray(value, limit) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeSeoOutput(output = "") {
  const cleaned = cleanJsonOutput(output);

  try {
    const parsed = JSON.parse(cleaned);

    const categories =
      parsed.googleBusinessCategories &&
      typeof parsed.googleBusinessCategories === "object"
        ? parsed.googleBusinessCategories
        : {};

    return {
      primaryKeyword: String(
        parsed.primaryKeyword || ""
      ).trim(),

      relatedKeywords: normalizeStringArray(
        parsed.relatedKeywords,
        10
      ),

      googleBusinessCategories: {
        primary: String(
          categories.primary || ""
        ).trim(),

        secondary: normalizeStringArray(
          categories.secondary,
          3
        ),
      },

      seoTitle: String(
        parsed.seoTitle || ""
      ).trim(),

      metaDescription: String(
        parsed.metaDescription || ""
      ).trim(),

      faqs: Array.isArray(parsed.faqs)
        ? parsed.faqs
            .map((item) => ({
              question: String(
                item?.question || ""
              ).trim(),

              answer: String(
                item?.answer || ""
              ).trim(),
            }))
            .filter(
              (item) =>
                item.question &&
                item.answer
            )
            .slice(0, 5)
        : [],

      napChecklist: normalizeStringArray(
        parsed.napChecklist,
        5
      ),

      localSeoChecklist: Array.isArray(
        parsed.localSeoChecklist
      )
        ? parsed.localSeoChecklist
            .map((item) => ({
              task: String(
                item?.task || ""
              ).trim(),

              priority: [
                "High",
                "Medium",
                "Low",
              ].includes(item?.priority)
                ? item.priority
                : "Medium",
            }))
            .filter((item) => item.task)
            .slice(0, 8)
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

    let body = {};

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
      state = "",
      country = "",
      services = "",
      audience = "",
    } = body;

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
      "Local Business";

    const finalCity =
      city.trim() ||
      profile.city ||
      "";

    const finalState =
      state.trim() ||
      profile.state ||
      "";

    const finalCountry =
      country.trim() ||
      profile.country ||
      "India";

    const profileServices =
      Array.isArray(profile.services)
        ? profile.services.join(", ")
        : profile.services || "";

    const finalServices =
      services.trim() ||
      profileServices ||
      "";

    const finalAudience =
      audience.trim() ||
      profile.targetCustomers ||
      "Local customers";

    if (!finalCity) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business city is required to generate Local SEO.",
        },
        {
          status: 400,
        }
      );
    }

    if (!finalServices) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one business service is required.",
        },
        {
          status: 400,
        }
      );
    }

    const location = [
      finalCity,
      finalState,
      finalCountry,
    ]
      .filter(Boolean)
      .join(", ");

    const prompt = `
You are Trendora's Local SEO Assistant.

Create a practical basic Local SEO package for a real local business.

Business details:

Business name: ${finalBusinessName}
Business type: ${finalBusinessType}
Location: ${location}
Services: ${finalServices}
Target audience: ${finalAudience}

Generate:

1. One primary local keyword
2. Exactly 10 related local keywords
3. One suggested primary Google Business Profile category
4. Up to 3 suggested secondary Google Business Profile categories
5. One SEO title
6. One meta description
7. Exactly 5 customer-focused local FAQs
8. Exactly 5 NAP consistency checklist items
9. Exactly 8 practical Local SEO checklist items

Important rules:

- Use the city naturally in local keywords.
- Generate keywords based on the actual services.
- Do not keyword-stuff.
- Do not invent search volume.
- Do not invent rankings.
- Do not claim access to Google Search, Google Maps, analytics or live competitor data.
- Do not invent prices, ratings, awards, reviews, years of experience or guarantees.
- Do not call the business "best", "number one", "top-rated" or similar unless proven.
- Google Business categories must logically match the business type.
- The SEO title should ideally stay under 60 characters.
- The meta description should ideally stay under 160 characters.
- FAQs must answer realistic customer questions.
- NAP means Business Name, Address and Phone Number consistency.
- Checklist items must be practical actions the business can complete.
- Priority must be exactly High, Medium or Low.
- Return valid JSON only.
- Do not add markdown.
- Do not add text before or after the JSON.

Return exactly this structure:

{
  "primaryKeyword": "Primary local keyword",
  "relatedKeywords": [
    "Keyword 1",
    "Keyword 2",
    "Keyword 3",
    "Keyword 4",
    "Keyword 5",
    "Keyword 6",
    "Keyword 7",
    "Keyword 8",
    "Keyword 9",
    "Keyword 10"
  ],
  "googleBusinessCategories": {
    "primary": "Primary category",
    "secondary": [
      "Secondary category 1",
      "Secondary category 2",
      "Secondary category 3"
    ]
  },
  "seoTitle": "SEO title",
  "metaDescription": "Meta description",
  "faqs": [
    {
      "question": "Question",
      "answer": "Answer"
    }
  ],
  "napChecklist": [
    "NAP checklist item"
  ],
  "localSeoChecklist": [
    {
      "task": "Local SEO task",
      "priority": "High"
    }
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
            "AI did not generate Local SEO content.",
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
      !seoContent.primaryKeyword ||
      !seoContent.seoTitle ||
      !seoContent.metaDescription ||
      !seoContent.googleBusinessCategories
        .primary ||
      seoContent.relatedKeywords.length === 0
    ) {
      console.error(
        "Invalid Local SEO AI output:",
        output
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "AI returned incomplete Local SEO data. Please try again.",
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
          "Local SEO package generated successfully.",

        data: {
          seoContent,

          input: {
            businessName:
              finalBusinessName,

            businessType:
              finalBusinessType,

            city: finalCity,

            state: finalState,

            country: finalCountry,

            services:
              finalServices,

            audience:
              finalAudience,
          },
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Business Local SEO error:",
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
          "Unable to generate Local SEO package.",

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