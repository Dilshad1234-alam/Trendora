import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import AgencyProfile from "@/models/AgencyProfile";

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
          message: "Please send agency details in JSON format.",
        },
        { status: 400 }
      );
    }

    const agencyName = body.agencyName?.trim();
    const logoUrl = body.logoUrl?.trim() || "";
    const country = body.country?.trim();
    const primaryColor = body.primaryColor?.trim() || "#7c3aed";
    const teamSize = body.teamSize?.trim() || "";
    const timezone = body.timezone?.trim() || "";
    const firstClient = body.firstClient?.trim() || "";

    if (!agencyName || !country) {
      return NextResponse.json(
        {
          success: false,
          message: "Agency Name and Country are required.",
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

    if (user.workspace !== "agency" && user.plan !== "agency") {
      return NextResponse.json(
        {
          success: false,
          message: "Only agency users can complete agency onboarding.",
        },
        { status: 403 }
      );
    }

    const existingProfile = await AgencyProfile.findOne({
      agencyId: user._id,
    });

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Agency profile already exists.",
        },
        { status: 409 }
      );
    }

    const agencyProfile = await AgencyProfile.create({
      agencyId: user._id,
      agencyName,
      logoUrl,
      country,
      primaryColor,
      teamSize,
      timezone,
      firstClient,
    });

    const trialStartDate = new Date();
    const trialEndsAt = new Date(
      trialStartDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    user.agencyOnboardingCompleted = true;
    user.onboardingCompleted = true; // Ensure standard flag is also true
    user.plan = "free"; // Start free trial
    user.planSelected = false;
    user.trialStartDate = trialStartDate;
    user.trialEndsAt = trialEndsAt;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Agency onboarding completed successfully.",
        data: {
          agencyOnboardingCompleted: user.agencyOnboardingCompleted,
          planSelected: user.planSelected,
          nextRoute: "/agency/dashboard",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Agency onboarding API error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Agency profile already exists.",
        },
        { status: 409 }
      );
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];

      return NextResponse.json(
        {
          success: false,
          message: firstError?.message || "Invalid agency profile data.",
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
