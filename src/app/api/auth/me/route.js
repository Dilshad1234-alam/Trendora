import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";

export async function GET() {
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

    const now = new Date();

    const trialEndsAt = user.trialEndsAt
      ? new Date(user.trialEndsAt)
      : null;
      
    const isTrialUser =
      user.role === "creator" ||
      user.role === "business";


    const trialExpired = Boolean( isTrialUser &&
      user.onboardingCompleted &&
        !user.planSelected &&
        trialEndsAt &&
        now >= trialEndsAt
    );

    const trialActive = Boolean( isTrialUser &&
      user.onboardingCompleted &&
        !user.planSelected &&
        trialEndsAt &&
        now < trialEndsAt
    );

    const trialTimeRemaining =
      trialActive && trialEndsAt
        ? trialEndsAt.getTime() - now.getTime()
        : 0;

    const trialDaysRemaining =
      trialTimeRemaining > 0
        ? Math.ceil(
            trialTimeRemaining /
              (24 * 60 * 60 * 1000)
          )
        : 0;

    let nextRoute = "/";

    if (user.role === "admin") {
      nextRoute = "/admin/dashboard";
    } else if (!user.role) {
      nextRoute = "/onboarding/select-role";
    } else if (
      user.role === "creator" &&
      !user.onboardingCompleted
    ) {
      nextRoute = "/onboarding/creator";
    } else if (
      user.role === "business" &&
      !user.onboardingCompleted
    ) {
      nextRoute = "/onboarding/business";
    } else if (trialExpired) {
      nextRoute = "/onboarding/select-plan";
    } else if (user.plan === "agent") {
      nextRoute = "/agent/dashboard";
    } else if (
      user.role === "creator" &&
      user.plan === "creator-pro"
    ) {
      nextRoute = "/creator-pro/dashboard";
    } else if (
      user.role === "business" &&
      user.plan === "business-pro"
    ) {
      nextRoute = "/business-pro/dashboard";
    } else if (user.role === "creator") {
      nextRoute = "/creator/dashboard";
    } else if (user.role === "business") {
      nextRoute = "/business/dashboard";
    }
    return NextResponse.json(
      {
        success: true,
        message: "Current user fetched successfully.",
        nextRoute,

        user: {
          id: user._id.toString(),
          fullname: user.fullname,
          email: user.email,
          image: user.image || "",
          role: user.role,

          plan: user.plan || "free",
          planSelected: Boolean(user.planSelected),
          onboardingCompleted: Boolean(
            user.onboardingCompleted
          ),

          trialStartDate: user.trialStartDate,
          trialEndsAt: user.trialEndsAt,
          trialActive,
          trialExpired,
          trialDaysRemaining,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get current user API error:", error);

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