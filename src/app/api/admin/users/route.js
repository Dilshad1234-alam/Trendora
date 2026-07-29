import { verifyAdmin } from "@/lib/auth/verifyAdmin";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const plan = searchParams.get("plan") || "";
    const status = searchParams.get("status") || ""; // 'active', 'suspended', 'trial', 'expired'
    const sort = searchParams.get("sort") || "newest";

    const query = { role: { $ne: "admin" } };

    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) query.role = role;
    if (plan) query.plan = plan;

    if (status === "suspended") query.suspended = true;
    else if (status === "active") query.suspended = false;
    else if (status === "trial") query.trialEndsAt = { $gt: new Date() };
    else if (status === "expired") query.trialEndsAt = { $lt: new Date() };

    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    else if (sort === "lastLogin") sortOptions = { lastLogin: -1 };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select("-password"),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
