import { verifyAdmin } from "@/lib/auth/verifyAdmin";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdminLog from "@/models/AdminLog";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const action = searchParams.get("action") || "";

    const query = {};
    if (action) query.action = action;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AdminLog.find(query)
        .populate("adminId", "fullname email")
        .populate("targetUserId", "fullname email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AdminLog.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Admin audit logs API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
