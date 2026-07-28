import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import gemini from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import AgencyDailyPlan from "@/models/AgencyDailyPlan";

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

import { agencyAccess } from "@/lib/agencyAccess";

const normalizeActionSteps = (steps = []) => {
  if (!Array.isArray(steps)) return [];
  return steps
    .map((step) => {
      if (typeof step === "string") return { text: step.trim(), completed: false };
      return { text: String(step?.text || "").trim(), completed: false };
    })
    .filter((step) => step.text);
};

const formatPlan = (plan) => {
  if (!plan) return null;

  const actionSteps = (plan.actionSteps || []).map((step) => ({
    id: step._id?.toString() || null,
    text: step.text || "",
    completed: Boolean(step.completed),
  }));

  const completedSteps = actionSteps.filter((step) => step.completed).length;
  const totalSteps = actionSteps.length;
  const stepsProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return {
    id: plan._id?.toString() || null,
    dateKey: plan.dateKey,
    agencyGoal: plan.agencyGoal,
    topic: plan.topic,
    clientFocus: plan.clientFocus,
    actionSteps,
    aiTip: plan.aiTip || "",
    estimatedTime: plan.estimatedTime || "60 minutes",
    difficulty: plan.difficulty || "medium",
    source: plan.source || "ai",
    completed: Boolean(plan.completed),
    regenerationCount: plan.regenerationCount || 0,
    completedSteps,
    totalSteps,
    stepsProgress,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
};

const getFallbackPlan = () => ({
  agencyGoal: "Acquire new clients and scale operations",
  topic: "Client Acquisition Strategy",
  clientFocus: "New Leads",
  actionSteps: [
    { text: "Review active client campaigns for optimizations.", completed: false },
    { text: "Send a monthly performance report to 3 top clients.", completed: false },
    { text: "Prospect 5 new local businesses via LinkedIn.", completed: false },
    { text: "Schedule a team meeting to discuss AI automation.", completed: false },
    { text: "Generate 2 bulk ad-copies for an ongoing campaign.", completed: false },
  ],
  aiTip: "Focus on client retention. A happy client is your best marketing tool.",
  estimatedTime: "60 minutes",
  difficulty: "medium",
  source: "fallback",
});

const generateAgencyPlan = async (user, dateKey) => {
  const prompt = `
You are Trendora, an expert AI Agency Growth Consultant.

Create one realistic daily growth plan for an agency owner today.

Agency Owner Name: ${user.fullname || "Agency Owner"}
Date: ${dateKey}

Return only valid JSON:

{
  "agencyGoal": "one realistic agency-level goal for today",
  "topic": "one core focus topic (e.g., Lead Gen, Client Retention, Automation)",
  "clientFocus": "e.g., E-commerce clients, Local businesses, or General Agency",
  "actionSteps": [
    "step 1",
    "step 2",
    "step 3",
    "step 4",
    "step 5"
  ],
  "aiTip": "one practical agency scaling tip using AI",
  "estimatedTime": "estimated completion time (e.g., 60 minutes)",
  "difficulty": "medium"
}

Rules:
- Keep the plan professional and geared towards scaling an agency, managing clients, or automating tasks.
- Keep it achievable today.
- difficulty must be easy, medium or hard.
- Return JSON only.
`;

  const interaction = await gemini.interactions.create({
    model: "gemini-1.5-flash",
    input: prompt,
  });

  const rawOutput = interaction.output_text?.trim();

  if (!rawOutput) {
    throw new Error("AI did not return an agency plan.");
  }

  const parsed = JSON.parse(cleanJsonOutput(rawOutput));
  const actionSteps = normalizeActionSteps(parsed.actionSteps);

  if (!parsed.agencyGoal || !parsed.topic || actionSteps.length === 0) {
    throw new Error("AI returned incomplete agency-plan data.");
  }

  const difficulty = String(parsed.difficulty || "medium").toLowerCase();

  return {
    agencyGoal: String(parsed.agencyGoal).trim(),
    topic: String(parsed.topic).trim(),
    clientFocus: String(parsed.clientFocus || "General Agency").trim(),
    actionSteps,
    aiTip: String(parsed.aiTip || "").trim(),
    estimatedTime: String(parsed.estimatedTime || "60 minutes").trim(),
    difficulty: ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "medium",
    source: "ai",
  };
};

export async function GET() {
  try {
    await connectDB();
    const auth = await agencyAccess();
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });
    }

    const dateKey = getDateKey();
    const existingPlan = await AgencyDailyPlan.findOne({ user: auth.user._id, dateKey });

    if (existingPlan) {
      return NextResponse.json(
        {
          success: true,
          message: "Today's agency plan fetched successfully.",
          source: "database",
          data: formatPlan(existingPlan),
        },
        { status: 200 }
      );
    }

    let generatedPlan;
    try {
      generatedPlan = await generateAgencyPlan(auth.user, dateKey);
    } catch (aiError) {
      console.error("Agency daily-plan AI error:", aiError);
      generatedPlan = getFallbackPlan();
    }

    let dailyPlan;
    try {
      dailyPlan = await AgencyDailyPlan.create({
        user: auth.user._id,
        dateKey,
        ...generatedPlan,
        completed: false,
        regenerationCount: 0,
      });
    } catch (databaseError) {
      if (databaseError?.code === 11000) {
        dailyPlan = await AgencyDailyPlan.findOne({ user: auth.user._id, dateKey });
      } else {
        throw databaseError;
      }
    }

    if (!dailyPlan) {
      return NextResponse.json({ success: false, message: "Agency daily plan could not be created." }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: generatedPlan.source === "ai" ? "Today's AI agency plan prepared successfully." : "Fallback agency plan prepared successfully.",
        source: generatedPlan.source,
        data: formatPlan(dailyPlan),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Agency daily plan GET error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load today's agency plan.", error: process.env.NODE_ENV === "development" ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Please send valid JSON data." }, { status: 400 });
    }

    const dateKey = getDateKey();
    const dailyPlan = await AgencyDailyPlan.findOne({ user: auth.user._id, dateKey });

    if (!dailyPlan) {
      return NextResponse.json({ success: false, message: "Today's agency plan not found." }, { status: 404 });
    }

    if (body.action === "toggle-step") {
      if (!body.stepId) return NextResponse.json({ success: false, message: "Action step ID is required." }, { status: 400 });

      const step = dailyPlan.actionSteps.id(body.stepId);
      if (!step) return NextResponse.json({ success: false, message: "Action step not found." }, { status: 404 });

      step.completed = !step.completed;

      const allStepsCompleted = dailyPlan.actionSteps.length > 0 && dailyPlan.actionSteps.every((item) => item.completed);
      if (!allStepsCompleted) dailyPlan.completed = false;

      await dailyPlan.save();
      return NextResponse.json({ success: true, message: "Action step updated.", data: formatPlan(dailyPlan) }, { status: 200 });
    }

    if (body.action === "complete") {
      if (typeof body.completed !== "boolean") return NextResponse.json({ success: false, message: "Completed value must be true or false." }, { status: 400 });

      const allStepsCompleted = dailyPlan.actionSteps.length > 0 && dailyPlan.actionSteps.every((step) => step.completed);
      if (body.completed && !allStepsCompleted) return NextResponse.json({ success: false, message: "Complete all action steps first." }, { status: 400 });

      dailyPlan.completed = body.completed;
      await dailyPlan.save();
      return NextResponse.json(
        { success: true, message: dailyPlan.completed ? "Agency daily plan completed." : "Agency daily plan marked as pending.", data: formatPlan(dailyPlan) },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: false, message: "Invalid agency daily-plan action." }, { status: 400 });
  } catch (error) {
    console.error("Agency daily plan PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update agency daily plan.", error: process.env.NODE_ENV === "development" ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Please send valid JSON data." }, { status: 400 });
    }

    if (body.action !== "regenerate") {
      return NextResponse.json({ success: false, message: "Invalid regenerate request." }, { status: 400 });
    }

    const dateKey = getDateKey();
    const currentPlan = await AgencyDailyPlan.findOne({ user: auth.user._id, dateKey });

    if (!currentPlan) {
      return NextResponse.json({ success: false, message: "Generate today's agency plan first." }, { status: 404 });
    }

    let regeneratedPlan;
    try {
      regeneratedPlan = await generateAgencyPlan(auth.user, dateKey);
    } catch (aiError) {
      console.error("Agency plan regeneration AI error:", aiError);
      if (aiError?.status === 429 || aiError?.statusCode === 429) {
        return NextResponse.json({ success: false, message: "AI request limit reached. Please wait and try again." }, { status: 429 });
      }
      return NextResponse.json(
        { success: false, message: "AI could not regenerate the agency plan.", error: process.env.NODE_ENV === "development" ? aiError.message : undefined },
        { status: 503 }
      );
    }

    currentPlan.agencyGoal = regeneratedPlan.agencyGoal;
    currentPlan.topic = regeneratedPlan.topic;
    currentPlan.clientFocus = regeneratedPlan.clientFocus;
    currentPlan.actionSteps = regeneratedPlan.actionSteps;
    currentPlan.aiTip = regeneratedPlan.aiTip;
    currentPlan.estimatedTime = regeneratedPlan.estimatedTime;
    currentPlan.difficulty = regeneratedPlan.difficulty;
    currentPlan.source = "ai";
    currentPlan.completed = false;
    currentPlan.regenerationCount += 1;

    await currentPlan.save();

    return NextResponse.json(
      { success: true, message: "Agency daily plan regenerated successfully.", data: formatPlan(currentPlan) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Agency daily plan POST error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to regenerate agency daily plan.", error: process.env.NODE_ENV === "development" ? error.message : undefined },
      { status: 500 }
    );
  }
}
