import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";

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
          message: "Please send business details in JSON format.",
        },
        { status: 400 }
      );
    }

    const businessName = body.businessName?.trim();
    const businessType = body.businessType?.trim();
    const city = body.city?.trim();
    const targetCustomers = body.targetCustomers?.trim() || "";
    const goal = body.goal?.trim();
    const onlinePresence = body.onlinePresence?.trim() || "";

    const services = Array.isArray(body.services)
      ? body.services.map((service) => service.trim()).filter(Boolean)
      : [];

    if (
      !businessName ||
      !businessType ||
      !city ||
      services.length === 0 ||
      !goal
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required business fields.",
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

    if (user.role !== "business") {
      return NextResponse.json(
        {
          success: false,
          message: "Only business users can complete business onboarding.",
        },
        { status: 403 }
      );
    }

    const existingProfile = await BusinessProfile.findOne({
      user: user._id,
    });

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Business profile already exists.",
        },
        { status: 409 }
      );
    }

    const businessProfile = await BusinessProfile.create({
      user: user._id,
      businessName,
      businessType,
      city,
      services,
      targetCustomers,
      goal,
      onlinePresence,
    });

    // user.onboardingCompleted = true;

    const trialStartDate = new Date();

    const trialEndsAt = new Date(
      trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000
    );

    user.onboardingCompleted = true;
    user.plan = "free";
    user.planSelected = false;
    user.trialStartDate = trialStartDate;
    user.trialEndsAt = trialEndsAt;

    await user.save();

    const savedUser = await User.findById(
      user._id
    ).lean();

    console.log("Saved user from DB:", {
      onboardingCompleted:
        savedUser.onboardingCompleted,
      plan: savedUser.plan,
      planSelected: savedUser.planSelected,
      trialStartDate:
        savedUser.trialStartDate,
      trialEndsAt:
        savedUser.trialEndsAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Business onboarding completed successfully.",
        businessProfile: {
          id: businessProfile._id.toString(),
          user: businessProfile.user.toString(),
          businessName: businessProfile.businessName,
          businessType: businessProfile.businessType,
          city: businessProfile.city,
          services: businessProfile.services,
          targetCustomers: businessProfile.targetCustomers,
          goal: businessProfile.goal,
          onlinePresence: businessProfile.onlinePresence,
        },

        data: {
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          plan: user.plan,
          planSelected: user.planSelected,
          trialStartDate: user.trialStartDate,
          trialEndsAt: user.trialEndsAt,
          nextRoute: "/business/dashboard",
        },

        nextRoute: "/business/dashboard",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Business onboarding API error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Business profile already exists.",
        },
        { status: 409 }
      );
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];

      return NextResponse.json(
        {
          success: false,
          message: firstError?.message || "Invalid business profile data.",
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