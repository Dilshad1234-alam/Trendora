import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import SavedContent from "@/models/SavedContent";

export async function DELETE(request, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid saved content ID.",
        },
        { status: 400 }
      );
    }

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

    const savedContent = await SavedContent.findOneAndDelete({
      _id: id,
      user: user._id,
    });

    if (!savedContent) {
      return NextResponse.json(
        {
          success: false,
          message: "Saved content not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Saved content deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete saved content API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete saved content.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}