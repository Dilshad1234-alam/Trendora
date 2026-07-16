import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import CreatorProfile from "@/models/CreatorProfile";
import DailyPlan from "@/models/DailyPlan";

const getDateKey = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

const formatPlan = (plan) => {
  if (!plan) return null;

  return {
    id: plan._id?.toString() || null,
    dateKey: plan.dateKey,
    topic: plan.topic,
    format: plan.format,
    hookIdea: plan.hookIdea,
    actionSteps: plan.actionSteps || [],
    cta: plan.cta,
    postingTime: plan.postingTime || "",
    completed: Boolean(plan.completed),
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
      error: "Please complete creator onboarding first.",
      status: 403,
    };
  }

  return {
    user,
  };
};

const cleanJsonOutput = (output = "") => {
  return output
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
};

const getFallbackPlan = (creatorProfile, dateKey) => {
  const niche = creatorProfile?.niche || "your niche";
  const platform = creatorProfile?.platform || "social media";

  return {
    dateKey,
    topic: `Share one practical tip about ${niche}`,
    format: platform === "youtube" ? "short video" : "reel",
    hookIdea: `Most people make this mistake when learning about ${niche}.`,
    actionSteps: [
      "Choose one common problem your audience faces.",
      "Explain one simple and practical solution.",
      "Record a short video using clear examples.",
      "Add a direct call to action at the end.",
    ],
    cta: "Save this post and follow for more practical tips.",
    postingTime: "7:00 PM",
    completed: false,
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
        {
          status: auth.status,
        }
      );
    }

    const dateKey = getDateKey();

    // 1. Aaj ka plan pehle MongoDB me check karein
    const existingPlan = await DailyPlan.findOne({
      user: auth.user._id,
      dateKey,
    }).lean();

    if (existingPlan) {
      return NextResponse.json(
        {
          success: true,
          message: "Today's plan fetched successfully.",
          source: "database",
          data: formatPlan(existingPlan),
        },
        {
          status: 200,
        }
      );
    }

    const creatorProfile = await CreatorProfile.findOne({
      user: auth.user._id,
    }).lean();

    if (!creatorProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const prompt = `
You are Trendora, an expert daily content planner.

Create one practical content plan for today.

Creator profile:
Niche: ${creatorProfile.niche}
Platform: ${creatorProfile.platform}
Language: ${creatorProfile.language}
Tone: ${creatorProfile.tone}
Audience size: ${creatorProfile.audienceSize}
Goal: ${creatorProfile.goal}
Date: ${dateKey}

Return only valid JSON in this exact structure:

{
  "topic": "content topic",
  "format": "reel, carousel, post or short",
  "hookIdea": "one short hook",
  "actionSteps": [
    "step 1",
    "step 2",
    "step 3",
    "step 4"
  ],
  "cta": "one call to action",
  "postingTime": "suggested posting time"
}

Rules:
- Write all content in ${creatorProfile.language}.
- Make the plan realistic and easy to complete today.
- Do not invent statistics.
- Avoid guaranteed claims.
- Return JSON only.
`;

    let parsedPlan;

    try {
      const interaction = await gemini.interactions.create({
        model: "gemini-3.5-flash",
        input: prompt,
      });

      const rawOutput = interaction.output_text?.trim();

      if (!rawOutput) {
        throw new Error("AI did not return a daily plan.");
      }

      parsedPlan = JSON.parse(cleanJsonOutput(rawOutput));

      if (
        !parsedPlan.topic ||
        !parsedPlan.format ||
        !parsedPlan.hookIdea ||
        !Array.isArray(parsedPlan.actionSteps) ||
        parsedPlan.actionSteps.length === 0 ||
        !parsedPlan.cta
      ) {
        throw new Error("AI returned incomplete daily-plan data.");
      }
    } catch (aiError) {
      console.error("Daily plan AI error:", aiError);

      // 2. Gemini fail hone par latest saved plan return karein
      const latestPlan = await DailyPlan.findOne({
        user: auth.user._id,
      })
        .sort({
          dateKey: -1,
          createdAt: -1,
        })
        .lean();

      if (latestPlan) {
        return NextResponse.json(
          {
            success: true,
            message:
              "AI limit reached. Showing your latest saved daily plan.",
            source: "previous-plan",
            quotaLimited: true,
            data: formatPlan(latestPlan),
          },
          {
            status: 200,
          }
        );
      }

      // 3. Koi purana plan bhi nahi hai to local fallback plan save karein
      parsedPlan = getFallbackPlan(creatorProfile, dateKey);
    }

    let dailyPlan;

    try {
      dailyPlan = await DailyPlan.create({
        user: auth.user._id,
        dateKey,
        topic: parsedPlan.topic,
        format: parsedPlan.format,
        hookIdea: parsedPlan.hookIdea,
        actionSteps: parsedPlan.actionSteps,
        cta: parsedPlan.cta,
        postingTime: parsedPlan.postingTime || "",
        completed: false,
      });
    } catch (databaseError) {
      // Multiple simultaneous requests me duplicate plan create ho sakta hai
      if (databaseError?.code === 11000) {
        dailyPlan = await DailyPlan.findOne({
          user: auth.user._id,
          dateKey,
        });
      } else {
        throw databaseError;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Today's plan prepared successfully.",
        source: parsedPlan.completed === false ? "fallback-or-ai" : "ai",
        data: formatPlan(dailyPlan),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Daily plan API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load today's plan.",
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

    const completed = Boolean(body.completed);
    const dateKey = getDateKey();

    const dailyPlan = await DailyPlan.findOneAndUpdate(
      {
        user: auth.user._id,
        dateKey,
      },
      {
        completed,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!dailyPlan) {
      return NextResponse.json(
        {
          success: false,
          message: "Today's plan not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: completed
          ? "Daily plan completed successfully."
          : "Daily plan marked as pending.",
        data: formatPlan(dailyPlan),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Daily plan update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update daily plan.",
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