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

  return { user };
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

    let dailyPlan = await DailyPlan.findOne({
      user: auth.user._id,
      dateKey,
    });

    // Aaj ka plan already hai
    if (dailyPlan) {
      return NextResponse.json(
        {
          success: true,
          message: "Today's plan fetched successfully.",
          data: dailyPlan,
        },
        { status: 200 }
      );
    }

    const creatorProfile = await CreatorProfile.findOne({
      user: auth.user._id,
    });

    if (!creatorProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator profile not found.",
        },
        { status: 404 }
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
    "step 3"
  ],
  "cta": "one call to action",
  "postingTime": "suggested time"
}

Rules:
- Write all content in ${creatorProfile.language}.
- Make the plan realistic and easy to execute today.
- Do not invent statistics.
- Avoid guaranteed results.
- Return JSON only.
`;

    const interaction = await gemini.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });

    const rawOutput = interaction.output_text?.trim();

    if (!rawOutput) {
      return NextResponse.json(
        {
          success: false,
          message: "AI did not return a daily plan.",
        },
        { status: 502 }
      );
    }

    const cleanedOutput = rawOutput
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsedPlan;

    try {
      parsedPlan = JSON.parse(cleanedOutput);
    } catch {
      console.error("Invalid daily plan JSON:", rawOutput);

      return NextResponse.json(
        {
          success: false,
          message: "AI returned an invalid daily plan.",
        },
        { status: 502 }
      );
    }

    if (
      !parsedPlan.topic ||
      !parsedPlan.format ||
      !parsedPlan.hookIdea ||
      !Array.isArray(parsedPlan.actionSteps) ||
      parsedPlan.actionSteps.length === 0 ||
      !parsedPlan.cta
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "AI returned incomplete daily-plan data.",
        },
        { status: 502 }
      );
    }

    dailyPlan = await DailyPlan.create({
      user: auth.user._id,
      dateKey,
      topic: parsedPlan.topic,
      format: parsedPlan.format,
      hookIdea: parsedPlan.hookIdea,
      actionSteps: parsedPlan.actionSteps,
      cta: parsedPlan.cta,
      postingTime: parsedPlan.postingTime || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Today's plan generated successfully.",
        data: dailyPlan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Daily plan API error:", error);

    // Same date par simultaneous requests hone par existing plan return karein
    if (error.code === 11000) {
      const dateKey = getDateKey();
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      const decoded = verifyToken(token);

      const existingPlan = await DailyPlan.findOne({
        user: decoded.userId,
        dateKey,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Today's plan fetched successfully.",
          data: existingPlan,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load today's plan.",
        error:
          process.env.NODE_ENV === "development"
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
      }
    );

    if (!dailyPlan) {
      return NextResponse.json(
        {
          success: false,
          message: "Today's plan not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: completed
          ? "Daily plan completed."
          : "Daily plan marked as pending.",
        data: dailyPlan,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update daily plan API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update daily plan.",
      },
      { status: 500 }
    );
  }
}
