import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import BusinessDailyPlan from "@/models/BusinessDailyPlan";

const getDateKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const cleanJsonOutput = (output = "") =>
  output
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

const getAuthenticatedBusiness = async () => {
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
      error: "Only business users can access this resource.",
      status: 403,
    };
  }

  if (!user.onboardingCompleted) {
    return {
      error: "Please complete business onboarding first.",
      status: 403,
    };
  }

  if (!user.planSelected || !user.plan) {
    return {
      error: "Please select a plan first.",
      status: 403,
    };
  }

  return {
    user,
  };
};

const normalizeActionSteps = (steps = []) => {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps
    .map((step) => {
      if (typeof step === "string") {
        return {
          text: step.trim(),
          completed: false,
        };
      }

      return {
        text: String(step?.text || "").trim(),
        completed: false,
      };
    })
    .filter((step) => step.text);
};

const formatPlan = (plan) => {
  if (!plan) return null;

  const actionSteps = (plan.actionSteps || []).map(
    (step) => ({
      id: step._id?.toString() || null,
      text: step.text || "",
      completed: Boolean(step.completed),
    })
  );

  const completedSteps = actionSteps.filter(
    (step) => step.completed
  ).length;

  const totalSteps = actionSteps.length;

  const stepsProgress =
    totalSteps > 0
      ? Math.round(
          (completedSteps / totalSteps) * 100
        )
      : 0;

  return {
    id: plan._id?.toString() || null,
    dateKey: plan.dateKey,
    businessGoal: plan.businessGoal,
    topic: plan.topic,
    platform: plan.platform,
    contentType: plan.contentType,
    offerIdea: plan.offerIdea || "",
    targetCustomer: plan.targetCustomer || "",
    actionSteps,
    cta: plan.cta,
    postingTime: plan.postingTime || "",
    aiTip: plan.aiTip || "",
    estimatedTime:
      plan.estimatedTime || "45 minutes",
    difficulty: plan.difficulty || "easy",
    source: plan.source || "ai",
    completed: Boolean(plan.completed),
    regenerationCount:
      plan.regenerationCount || 0,
    completedSteps,
    totalSteps,
    stepsProgress,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
};

const getFallbackPlan = (profile) => ({
  businessGoal:
    profile.goal || "Increase local visibility",

  topic: `Promote ${
    profile.services?.[0] ||
    profile.businessType
  }`,

  platform:
    profile.onlinePresence || "Instagram",

  contentType: "Business promotion post",

  offerIdea:
    "Highlight one clear customer benefit",

  targetCustomer:
    profile.targetCustomers ||
    `Customers in ${profile.city}`,

  actionSteps: [
    {
      text: "Choose one product or service to promote.",
      completed: false,
    },
    {
      text: "Create a customer-focused promotional post.",
      completed: false,
    },
    {
      text: `Mention ${profile.city} in the post or caption.`,
      completed: false,
    },
    {
      text: "Generate local and service-related hashtags.",
      completed: false,
    },
    {
      text: "Prepare a short WhatsApp customer message.",
      completed: false,
    },
    {
      text: "Publish the content on your main platform.",
      completed: false,
    },
    {
      text: "Reply to customer questions and enquiries.",
      completed: false,
    },
  ],

  cta: "Message us today for more details.",

  postingTime: "7:00 PM",

  aiTip:
    "Focus on one benefit and one clear action for the customer.",

  estimatedTime: "45 minutes",

  difficulty: "easy",

  source: "fallback",
});

const generateBusinessPlan = async (
  profile,
  dateKey
) => {
  const prompt = `
You are Trendora, an expert local-business growth planner.

Create one realistic business growth plan for today.

Business profile:
Business name: ${profile.businessName}
Business type: ${profile.businessType}
City: ${profile.city}
Services: ${(profile.services || []).join(", ")}
Target customers: ${
    profile.targetCustomers || "Local customers"
  }
Business goal: ${profile.goal}
Online presence: ${
    profile.onlinePresence || "Social media"
  }
Date: ${dateKey}

Return only valid JSON:

{
  "businessGoal": "one realistic business goal for today",
  "topic": "one promotional or educational topic",
  "platform": "best platform for this plan",
  "contentType": "post, reel, story, Google Business update or WhatsApp broadcast",
  "offerIdea": "one realistic offer idea or empty string",
  "targetCustomer": "specific customer group",
  "actionSteps": [
    "step 1",
    "step 2",
    "step 3",
    "step 4",
    "step 5",
    "step 6"
  ],
  "cta": "one clear customer call to action",
  "postingTime": "suggested posting time",
  "aiTip": "one practical local business growth tip",
  "estimatedTime": "estimated completion time",
  "difficulty": "easy"
}

Rules:
- Make the plan suitable for ${profile.businessType} in ${profile.city}.
- Use the listed services.
- Match the goal: ${profile.goal}.
- Keep it achievable today.
- Do not invent discounts, prices, addresses or statistics.
- difficulty must be easy, medium or hard.
- Return JSON only.
`;

  const interaction =
    await gemini.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });

  const rawOutput =
    interaction.output_text?.trim();

  if (!rawOutput) {
    throw new Error(
      "AI did not return a business plan."
    );
  }

  const parsed = JSON.parse(
    cleanJsonOutput(rawOutput)
  );

  const actionSteps = normalizeActionSteps(
    parsed.actionSteps
  );

  if (
    !parsed.businessGoal ||
    !parsed.topic ||
    !parsed.platform ||
    !parsed.contentType ||
    !parsed.cta ||
    actionSteps.length === 0
  ) {
    throw new Error(
      "AI returned incomplete business-plan data."
    );
  }

  const difficulty = String(
    parsed.difficulty || "easy"
  ).toLowerCase();

  return {
    businessGoal: String(
      parsed.businessGoal
    ).trim(),

    topic: String(parsed.topic).trim(),

    platform: String(parsed.platform).trim(),

    contentType: String(
      parsed.contentType
    ).trim(),

    offerIdea: String(
      parsed.offerIdea || ""
    ).trim(),

    targetCustomer: String(
      parsed.targetCustomer || ""
    ).trim(),

    actionSteps,

    cta: String(parsed.cta).trim(),

    postingTime: String(
      parsed.postingTime || ""
    ).trim(),

    aiTip: String(
      parsed.aiTip || ""
    ).trim(),

    estimatedTime: String(
      parsed.estimatedTime || "45 minutes"
    ).trim(),

    difficulty: [
      "easy",
      "medium",
      "hard",
    ].includes(difficulty)
      ? difficulty
      : "easy",

    source: "ai",
  };
};

export async function GET() {
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

    const dateKey = getDateKey();

    const existingPlan =
      await BusinessDailyPlan.findOne({
        user: auth.user._id,
        dateKey,
      });

    if (existingPlan) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Today's business plan fetched successfully.",
          source: "database",
          data: formatPlan(existingPlan),
        },
        {
          status: 200,
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
          message:
            "Business profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    let generatedPlan;

    try {
      generatedPlan =
        await generateBusinessPlan(
          profile,
          dateKey
        );
    } catch (aiError) {
      console.error(
        "Business daily-plan AI error:",
        aiError
      );

      generatedPlan =
        getFallbackPlan(profile);
    }

    let dailyPlan;

    try {
      dailyPlan =
        await BusinessDailyPlan.create({
          user: auth.user._id,
          dateKey,
          ...generatedPlan,
          completed: false,
          regenerationCount: 0,
        });
    } catch (databaseError) {
      if (databaseError?.code === 11000) {
        dailyPlan =
          await BusinessDailyPlan.findOne({
            user: auth.user._id,
            dateKey,
          });
      } else {
        throw databaseError;
      }
    }

    if (!dailyPlan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business daily plan could not be created.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          generatedPlan.source === "ai"
            ? "Today's AI business plan prepared successfully."
            : "Fallback business plan prepared successfully.",
        source: generatedPlan.source,
        data: formatPlan(dailyPlan),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Business daily plan GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load today's business plan.",
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

export async function PATCH(request) {
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
          message:
            "Please send valid JSON data.",
        },
        {
          status: 400,
        }
      );
    }

    const dateKey = getDateKey();

    const dailyPlan =
      await BusinessDailyPlan.findOne({
        user: auth.user._id,
        dateKey,
      });

    if (!dailyPlan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Today's business plan not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (body.action === "toggle-step") {
      if (!body.stepId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Business action step ID is required.",
          },
          {
            status: 400,
          }
        );
      }

      const step =
        dailyPlan.actionSteps.id(
          body.stepId
        );

      if (!step) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Business action step not found.",
          },
          {
            status: 404,
          }
        );
      }

      step.completed = !step.completed;

      const allStepsCompleted =
        dailyPlan.actionSteps.length > 0 &&
        dailyPlan.actionSteps.every(
          (item) => item.completed
        );

      if (!allStepsCompleted) {
        dailyPlan.completed = false;
      }

      await dailyPlan.save();

      return NextResponse.json(
        {
          success: true,
          message:
            "Business action step updated.",
          data: formatPlan(dailyPlan),
        },
        {
          status: 200,
        }
      );
    }

    if (body.action === "complete") {
      if (
        typeof body.completed !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Completed value must be true or false.",
          },
          {
            status: 400,
          }
        );
      }

      const allStepsCompleted =
        dailyPlan.actionSteps.length > 0 &&
        dailyPlan.actionSteps.every(
          (step) => step.completed
        );

      if (
        body.completed &&
        !allStepsCompleted
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Complete all business action steps first.",
          },
          {
            status: 400,
          }
        );
      }

      dailyPlan.completed =
        body.completed;

      await dailyPlan.save();

      return NextResponse.json(
        {
          success: true,
          message:
            dailyPlan.completed
              ? "Business daily plan completed."
              : "Business daily plan marked as pending.",
          data: formatPlan(dailyPlan),
        },
        {
          status: 200,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid business daily-plan action.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "Business daily plan PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update business daily plan.",
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
          message:
            "Please send valid JSON data.",
        },
        {
          status: 400,
        }
      );
    }

    if (body.action !== "regenerate") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid regenerate request.",
        },
        {
          status: 400,
        }
      );
    }

    const dateKey = getDateKey();

    const currentPlan =
      await BusinessDailyPlan.findOne({
        user: auth.user._id,
        dateKey,
      });

    if (!currentPlan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Generate today's business plan first.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      auth.user.plan === "free" &&
      currentPlan.regenerationCount >= 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Free Plan allows one business-plan regeneration per day.",
        },
        {
          status: 403,
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
          message:
            "Business profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    let regeneratedPlan;

    try {
      regeneratedPlan =
        await generateBusinessPlan(
          profile,
          dateKey
        );
    } catch (aiError) {
      console.error(
        "Business plan regeneration AI error:",
        aiError
      );

      if (
        aiError?.status === 429 ||
        aiError?.statusCode === 429
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
            "AI could not regenerate the business plan.",
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

    currentPlan.businessGoal =
      regeneratedPlan.businessGoal;

    currentPlan.topic =
      regeneratedPlan.topic;

    currentPlan.platform =
      regeneratedPlan.platform;

    currentPlan.contentType =
      regeneratedPlan.contentType;

    currentPlan.offerIdea =
      regeneratedPlan.offerIdea;

    currentPlan.targetCustomer =
      regeneratedPlan.targetCustomer;

    currentPlan.actionSteps =
      regeneratedPlan.actionSteps;

    currentPlan.cta =
      regeneratedPlan.cta;

    currentPlan.postingTime =
      regeneratedPlan.postingTime;

    currentPlan.aiTip =
      regeneratedPlan.aiTip;

    currentPlan.estimatedTime =
      regeneratedPlan.estimatedTime;

    currentPlan.difficulty =
      regeneratedPlan.difficulty;

    currentPlan.source = "ai";
    currentPlan.completed = false;
    currentPlan.regenerationCount += 1;

    await currentPlan.save();

    return NextResponse.json(
      {
        success: true,
        message:
          "Business daily plan regenerated successfully.",
        data: formatPlan(currentPlan),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Business daily plan POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to regenerate business daily plan.",
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