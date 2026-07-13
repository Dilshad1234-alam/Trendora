import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const fullname = body.fullname?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // Required fields validation
    if (!fullname || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name, email and password are required.",
        },
        { status: 400 }
      );
    }

    // Full name validation
    if (fullname.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name must contain at least 2 characters.",
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least 6 characters.",
        },
        { status: 400 }
      );
    }

    // Duplicate email check
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 12);

    // User create
    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user._id.toString(),
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          plan: user.plan,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API error:", error);

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];

      return NextResponse.json(
        {
          success: false,
          message: firstError?.message || "Invalid user data.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}