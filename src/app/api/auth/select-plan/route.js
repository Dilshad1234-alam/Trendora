import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";

const allowedPlansByRole = {
  creator: ["free", "creator-pro"],
  business: ["free", "business-pro"],
};

export async function PATCH(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
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

    if (!user.role) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select your role first.",
        },
        { status: 400 }
      );
    }

    if (!user.onboardingCompleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete onboarding first.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const plan = body.plan?.trim().toLowerCase();

    const allowedPlans =
      allowedPlansByRole[user.role] || [];

    if (!plan || !allowedPlans.includes(plan)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid plan for selected role.",
        },
        { status: 400 }
      );
    }

    user.plan = plan;
    user.planSelected = true;
    user.subscriptionStatus = "active";
    user.planExpiresAt = null;

    // Trial khatam
    user.trialStartDate = null;
    user.trialEndsAt = null;

    await user.save();

    let nextRoute = "/";

    if (user.role === "creator") {
      nextRoute = "/creator/dashboard";
    }

    if (user.role === "business") {
      nextRoute = "/business/dashboard";
    }

    return NextResponse.json(
      {
        success: true,
        message: "Plan activated successfully.",
        data: {
          role: user.role,
          plan: user.plan,
          planSelected: user.planSelected,
          subscriptionStatus: user.subscriptionStatus,
          trialStartDate: user.trialStartDate,
          trialEndsAt: user.trialEndsAt,
          nextRoute,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Select plan API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to activate plan.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}