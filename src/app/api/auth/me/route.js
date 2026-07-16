import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    // Next.js me cookies() async hai
    const cookieStore = await cookies();

    // Login API me cookie ka naam "token" rakha tha
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
    } catch (error) {
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

    return NextResponse.json(
      {
        success: true,
        message: "Current user fetched successfully.",
        user: {
          id: user._id.toString(),
          fullname: user.fullname,
          email: user.email,
          image: user.image || "",
          role: user.role,
          plan: user.plan,
          planSelected: user.planSelected,
          onboardingCompleted: user.onboardingCompleted,
          // subscriptionStatus: user.subscriptionStatus
          // plan: user.plan,
          // createdAt: user.createdAt,
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