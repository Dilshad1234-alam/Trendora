import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import CreatorProfile from "@/models/CreatorProfile";

export async function POST(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    let decoded;

    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token.",
        },
        { status: 401 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please send creator details in JSON format.",
        },
        { status: 400 }
      );
    }

    const niche = body.niche?.trim();
    const language = body.language?.trim();
    const platform = body.platform?.trim();
    const tone = body.tone?.trim();
    const audienceSize = body.audienceSize?.trim();
    const goal = body.goal?.trim();

    if (
      !niche ||
      !language ||
      !platform ||
      !tone ||
      !audienceSize ||
      !goal
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All creator onboarding fields are required.",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    if (user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only creator users can complete creator onboarding.",
        },
        { status: 403 }
      );
    }

    const existingProfile = await CreatorProfile.findOne({
      user: user._id,
    });

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator profile already exists.",
        },
        { status: 409 }
      );
    }

    const creatorProfile = await CreatorProfile.create({
      user: user._id,
      niche,
      language,
      platform,
      tone,
      audienceSize,
      goal,
    });

    user.onboardingCompleted = true;
    user.plan = null;
    user.planSelected = false;

    await user.save();

    return NextResponse.json(

      {
        success: true,
        message: "Creator onboarding completed successfully.",
        data: {
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          planSelected: user.planSelected,
          nextRoute: "/onboarding/select-plan",
        },
      },
      { status: 200 }
      // {
      //   success: true,
      //   message: "Creator onboarding completed successfully.",
      //   creatorProfile: {
      //     id: creatorProfile._id.toString(),
      //     user: creatorProfile.user.toString(),
      //     niche: creatorProfile.niche,
      //     language: creatorProfile.language,
      //     platform: creatorProfile.platform,
      //     tone: creatorProfile.tone,
      //     audienceSize: creatorProfile.audienceSize,
      //     goal: creatorProfile.goal,
      //   },
      //   nextRoute: "/creator/dashboard",
      // },
      // { status: 201 }
    );
  } catch (error) {
    console.error("Creator onboarding API error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator profile already exists.",
        },
        { status: 409 }
      );
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];

      return NextResponse.json(
        {
          success: false,
          message: firstError?.message || "Invalid creator profile data.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}