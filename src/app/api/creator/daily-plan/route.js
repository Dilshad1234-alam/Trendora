import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import CreatorProfile from "@/models/CreatorProfile";
import DailyPlan from "@/models/DailyPlan";

const getDateKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const normalizeActionSteps = (steps = []) =>
  steps.map((step) => {
    if (typeof step === "string") {
      return {
        text: step,
        completed: false,
      };
    }

    return {
      id: step._id?.toString() || step.id || null,
      text: step.text || "",
      completed: Boolean(step.completed),
    };
  });

const formatPlan = (plan) => {
  if (!plan) return null;

  const actionSteps = normalizeActionSteps(
    plan.actionSteps || []
  );

  const completedSteps = actionSteps.filter(
    (step) => step.completed
  ).length;

  const stepsProgress =
    actionSteps.length > 0
      ? Math.round(
          (completedSteps / actionSteps.length) * 100
        )
      : 0;

  return {
    id: plan._id?.toString() || null,
    dateKey: plan.dateKey,
    topic: plan.topic,
    format: plan.format,
    hookIdea: plan.hookIdea,
    actionSteps,
    cta: plan.cta,
    postingTime: plan.postingTime || "",
    aiTip: plan.aiTip || "",
    estimatedTime:
      plan.estimatedTime || "45 minutes",
    difficulty: plan.difficulty || "easy",
    contentGoal: plan.contentGoal || "",
    source: plan.source || "ai",
    regenerationCount:
      plan.regenerationCount || 0,
    completed: Boolean(plan.completed),
    completedSteps,
    totalSteps: actionSteps.length,
    stepsProgress,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
};

const getAuthenticatedCreator = async () => {
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

  if (user.role !== "creator") {
    return {
      error: "Only creators can access daily plans.",
      status: 403,
    };
  }

  if (!user.onboardingCompleted) {
    return {
      error:
        "Please complete creator onboarding first.",
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

  // Trial expire ho gaya aur plan select nahi kiya
  if (trialExpired) {
    return {
      error: "Please select a plan first.",
      status: 403,
    };
  }

  return { user };
};

const cleanJsonOutput = (output = "") =>
  output
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

const getFallbackPlan = (
  creatorProfile,
  dateKey
) => {
  const niche =
    creatorProfile?.niche || "your niche";

  const platform =
    creatorProfile?.platform || "social media";

  return {
    dateKey,
    topic: `Share one practical tip about ${niche}`,
    format:
      platform === "youtube"
        ? "short"
        : "reel",
    hookIdea: `Most people make this mistake when learning about ${niche}.`,
    actionSteps: [
      {
        text: "Research one common audience problem.",
        completed: false,
      },
      {
        text: "Generate and save the hook.",
        completed: false,
      },
      {
        text: "Create and save the script.",
        completed: false,
      },
      {
        text: "Write and save the caption.",
        completed: false,
      },
      {
        text: "Generate and save hashtags.",
        completed: false,
      },
      {
        text: "Create thumbnail titles.",
        completed: false,
      },
      {
        text: "Write the video description.",
        completed: false,
      },
      {
        text: "Publish the content.",
        completed: false,
      },
    ],
    cta: "Save this post and follow for more practical tips.",
    postingTime: "7:00 PM",
    aiTip:
      "Make the first three seconds clear and attention-grabbing.",
    estimatedTime: "45 minutes",
    difficulty: "easy",
    contentGoal:
      "Publish one useful piece of content today.",
    source: "fallback",
  };
};

const generatePlan = async (
  creatorProfile,
  dateKey
) => {
  const prompt = `
You are Trendora, an expert daily content planner.

Create one realistic content plan for today.

Creator profile:
Niche: ${creatorProfile.niche}
Platform: ${creatorProfile.platform}
Language: ${creatorProfile.language}
Tone: ${creatorProfile.tone}
Audience size: ${creatorProfile.audienceSize}
Goal: ${creatorProfile.goal}
Date: ${dateKey}

Return only valid JSON:

{
  "topic": "content topic",
  "format": "reel, carousel, post or short",
  "hookIdea": "one short hook",
  "actionSteps": [
    "Research one audience problem",
    "Generate and save the hook",
    "Create and save the script",
    "Write and save the caption",
    "Generate and save hashtags",
    "Create thumbnail titles",
    "Write the video description",
    "Publish the content"
  ],
  "cta": "one clear call to action",
  "postingTime": "7:00 PM",
  "aiTip": "one short practical content tip",
  "estimatedTime": "45 minutes",
  "difficulty": "easy",
  "contentGoal": "one realistic daily goal"
}

Rules:
- Write in ${creatorProfile.language}.
- difficulty must be easy, medium or hard.
- Keep the plan realistic for one day.
- Do not invent statistics.
- Do not make guaranteed claims.
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
      "AI did not return a daily plan."
    );
  }

  const parsedPlan = JSON.parse(
    cleanJsonOutput(rawOutput)
  );

  if (
    !parsedPlan.topic ||
    !parsedPlan.format ||
    !parsedPlan.hookIdea ||
    !Array.isArray(parsedPlan.actionSteps) ||
    parsedPlan.actionSteps.length === 0 ||
    !parsedPlan.cta
  ) {
    throw new Error(
      "AI returned incomplete daily-plan data."
    );
  }

  return {
    ...parsedPlan,
    difficulty: ["easy", "medium", "hard"].includes(
      parsedPlan.difficulty
    )
      ? parsedPlan.difficulty
      : "easy",
    actionSteps: parsedPlan.actionSteps.map(
      (text) => ({
        text,
        completed: false,
      })
    ),
    source: "ai",
  };
};

export async function GET() {
  try {
    await connectDB();

    const auth = await getAuthenticatedCreator();

    if (auth.error) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error,
        },
        { status: auth.status }
      );
    }

    const dateKey = getDateKey();

    const existingPlan = await DailyPlan.findOne({
      user: auth.user._id,
      dateKey,
    });

    if (existingPlan) {
      return NextResponse.json({
        success: true,
        message:
          "Today's plan fetched successfully.",
        source: "database",
        data: formatPlan(existingPlan),
      });
    }

    const creatorProfile =
      await CreatorProfile.findOne({
        user: auth.user._id,
      }).lean();

    if (!creatorProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator profile not found.",
        },
        { status: 404 }
      );
    }

    let parsedPlan;

    try {
      parsedPlan = await generatePlan(
        creatorProfile,
        dateKey
      );
    } catch (error) {
      console.error(
        "Daily plan AI error:",
        error
      );

      parsedPlan = getFallbackPlan(
        creatorProfile,
        dateKey
      );
    }

    let dailyPlan;

    try {
      dailyPlan = await DailyPlan.create({
        user: auth.user._id,
        dateKey,
        ...parsedPlan,
        completed: false,
        regenerationCount: 0,
      });
    } catch (error) {
      if (error?.code === 11000) {
        dailyPlan = await DailyPlan.findOne({
          user: auth.user._id,
          dateKey,
        });
      } else {
        throw error;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          parsedPlan.source === "ai"
            ? "Today's AI plan prepared successfully."
            : "Fallback daily plan prepared successfully.",
        source: parsedPlan.source,
        data: formatPlan(dailyPlan),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Daily plan GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load today's plan.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();

    const auth = await getAuthenticatedCreator();

    if (auth.error) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error,
        },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const dateKey = getDateKey();

    const dailyPlan = await DailyPlan.findOne({
      user: auth.user._id,
      dateKey,
    });

    if (!dailyPlan) {
      return NextResponse.json(
        {
          success: false,
          message: "Today's plan not found.",
        },
        { status: 404 }
      );
    }

    if (body.action === "toggle-step") {
      const step = dailyPlan.actionSteps.id(
        body.stepId
      );

      if (!step) {
        return NextResponse.json(
          {
            success: false,
            message: "Action step not found.",
          },
          { status: 404 }
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

      return NextResponse.json({
        success: true,
        message: "Action step updated.",
        data: formatPlan(dailyPlan),
      });
    }

    if (body.action === "edit") {
      const editableFields = [
        "topic",
        "format",
        "hookIdea",
        "cta",
        "postingTime",
        "aiTip",
        "estimatedTime",
        "difficulty",
        "contentGoal",
      ];

      editableFields.forEach((field) => {
        if (
          typeof body[field] === "string" &&
          body[field].trim()
        ) {
          dailyPlan[field] =
            body[field].trim();
        }
      });

      await dailyPlan.save();

      return NextResponse.json({
        success: true,
        message:
          "Daily plan updated successfully.",
        data: formatPlan(dailyPlan),
      });
    }

    if (body.action === "complete") {
      const allStepsCompleted =
        dailyPlan.actionSteps.length > 0 &&
        dailyPlan.actionSteps.every(
          (step) => step.completed
        );

      if (body.completed && !allStepsCompleted) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Complete all action steps before marking the plan complete.",
          },
          { status: 400 }
        );
      }

      dailyPlan.completed = Boolean(
        body.completed
      );

      await dailyPlan.save();

      return NextResponse.json({
        success: true,
        message: dailyPlan.completed
          ? "Daily plan completed successfully."
          : "Daily plan marked as pending.",
        data: formatPlan(dailyPlan),
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid daily-plan action.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Daily plan PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update daily plan.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const auth = await getAuthenticatedCreator();

    if (auth.error) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error,
        },
        { status: auth.status }
      );
    }

    const body = await request.json();

    if (body.action !== "regenerate") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid regenerate request.",
        },
        { status: 400 }
      );
    }

    const dateKey = getDateKey();

    const currentPlan = await DailyPlan.findOne({
      user: auth.user._id,
      dateKey,
    });

    if (!currentPlan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Generate today's plan first.",
        },
        { status: 404 }
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
            "Free Plan allows one daily-plan regeneration per day.",
        },
        { status: 403 }
      );
    }

    const creatorProfile =
      await CreatorProfile.findOne({
        user: auth.user._id,
      }).lean();

    if (!creatorProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator profile not found.",
        },
        { status: 404 }
      );
    }

    let regeneratedPlan;

    try {
      regeneratedPlan = await generatePlan(
        creatorProfile,
        dateKey
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AI could not regenerate the plan. Please try later.",
          error:
            process.env.NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        },
        { status: 503 }
      );
    }

    currentPlan.topic =
      regeneratedPlan.topic;

    currentPlan.format =
      regeneratedPlan.format;

    currentPlan.hookIdea =
      regeneratedPlan.hookIdea;

    currentPlan.actionSteps =
      regeneratedPlan.actionSteps;

    currentPlan.cta =
      regeneratedPlan.cta;

    currentPlan.postingTime =
      regeneratedPlan.postingTime || "";

    currentPlan.aiTip =
      regeneratedPlan.aiTip || "";

    currentPlan.estimatedTime =
      regeneratedPlan.estimatedTime ||
      "45 minutes";

    currentPlan.difficulty =
      regeneratedPlan.difficulty || "easy";

    currentPlan.contentGoal =
      regeneratedPlan.contentGoal || "";

    currentPlan.source = "ai";
    currentPlan.completed = false;
    currentPlan.regenerationCount += 1;

    await currentPlan.save();

    return NextResponse.json({
      success: true,
      message:
        "Daily plan regenerated successfully.",
      data: formatPlan(currentPlan),
    });
  } catch (error) {
    console.error(
      "Daily plan regenerate error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to regenerate daily plan.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}