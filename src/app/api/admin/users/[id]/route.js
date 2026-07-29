import { verifyAdmin } from "@/lib/auth/verifyAdmin";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import GeneratedContent from "@/models/GeneratedContent";
import Subscription from "@/models/Subscription";
import AdminLog from "@/models/AdminLog";
import jwt from "jsonwebtoken";

export async function GET(req, { params }) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Get related data concurrently
    const [aiUsage, subscriptions, recentActivity] = await Promise.all([
      GeneratedContent.countDocuments({ user: id }),
      Subscription.find({ user: id }).sort({ createdAt: -1 }),
      AdminLog.find({ targetUserId: id }).sort({ createdAt: -1 }).limit(10),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user,
        stats: {
          aiRequests: aiUsage,
        },
        subscriptions,
        recentActivity,
      }
    });

  } catch (error) {
    console.error("Admin user detail API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = params;
    const body = await req.json();

    const user = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true }).select("-password");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Log the action
    let action = "other";
    if (body.suspended !== undefined) action = body.suspended ? "user_suspended" : "user_activated";
    else if (body.plan) action = "plan_update";

    await AdminLog.create({
      adminId: admin.id,
      action,
      details: `Updated user ${user.email}`,
      targetUserId: user._id,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      metadata: body,
    });

    return NextResponse.json({ success: true, data: user });

  } catch (error) {
    console.error("Admin user update API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
