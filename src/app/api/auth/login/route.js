import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please send valid JSON data.",
        },
        { status: 400 }
      );
    }

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const now = new Date();

    const trialEndsAt = user.trialEndsAt
      ? new Date(user.trialEndsAt)
      : null;

    const trialExpired = Boolean(
      user.onboardingCompleted &&
        !user.planSelected &&
        trialEndsAt &&
        now >= trialEndsAt
    );

    const trialActive = Boolean(
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
            trialTimeRemaining / (24 * 60 * 60 * 1000)
          )
        : 0;

    let nextRoute = "/";

    if (!user.role) {
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
    } else if (user.role === "admin") {
      nextRoute = "/admin/dashboard";
    }

    const token = generateToken(user._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        nextRoute,

        user: {
          id: user._id.toString(),
          fullname: user.fullname,
          email: user.email,
          image: user.image || "",
          role: user.role,

          onboardingCompleted: Boolean(
            user.onboardingCompleted
          ),

          plan: user.plan || "free",
          planSelected: Boolean(user.planSelected),

          trialStartDate: user.trialStartDate,
          trialEndsAt: user.trialEndsAt,
          trialActive,
          trialExpired,
          trialDaysRemaining,
        },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

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