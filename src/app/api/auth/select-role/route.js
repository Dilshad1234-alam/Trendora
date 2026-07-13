import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";

export async function PATCH(request) {
  try {
    await connectDB();

    // Cookie se JWT token read karein
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

    // Token verify karein
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

    // Request body safely read karein
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please send role in JSON format.",
        },
        { status: 400 }
      );
    }

    const role = body.role?.trim().toLowerCase();

    // Sirf creator aur business allowed hain
    const allowedRoles = ["creator", "business"];

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a role.",
        },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role must be creator or business.",
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

    // Admin role API se select nahi kiya ja sakta
    if (user.role === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin role cannot be changed.",
        },
        { status: 403 }
      );
    }

    // Existing role ko dobara change hone se rokein
    if (user.role) {
      return NextResponse.json(
        {
          success: false,
          message: `Your role is already set as ${user.role}.`,
        },
        { status: 409 }
      );
    }

    user.role = role;

    // Abhi onboarding complete nahi hua
    user.onboardingCompleted = false;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: `Role selected successfully as ${role}.`,
        user: {
          id: user._id.toString(),
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          plan: user.plan,
        },
        nextRoute:
          role === "creator"
            ? "/onboarding/creator"
            : "/onboarding/business",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Select role API error:", error);

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