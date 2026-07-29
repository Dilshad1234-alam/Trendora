import { verifyAdmin } from "@/lib/auth/verifyAdmin";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import GeneratedContent from "@/models/GeneratedContent";
import Subscription from "@/models/Subscription";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Run aggregations concurrently
    const [
      totalUsers,
      activeUsers,
      todayUsers,
      freeTrialUsers,
      paidUsers,
      creatorUsers,
      businessUsers,
      agencyUsers,
      todayRevenueObj,
      monthlyRevenueObj,
      aiRequestsToday,
      totalAiRequests
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      User.countDocuments({ role: { $ne: "admin" }, lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ role: { $ne: "admin" }, createdAt: { $gte: today } }),
      User.countDocuments({ plan: "free", trialEndsAt: { $gt: new Date() } }),
      User.countDocuments({ plan: { $ne: "free" } }),
      User.countDocuments({ role: "creator" }),
      User.countDocuments({ role: "business" }),
      User.countDocuments({ role: "agency" }),
      Subscription.aggregate([
        { $match: { createdAt: { $gte: today }, status: "active" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Subscription.aggregate([
        { $match: { createdAt: { $gte: firstDayOfMonth }, status: "active" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      GeneratedContent.countDocuments({ createdAt: { $gte: today } }),
      GeneratedContent.countDocuments(),
    ]);

    const todayRevenue = todayRevenueObj[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueObj[0]?.total || 0;

    // We can calculate conversion rate simply if we have trial and paid info
    const trialConversion = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : 0;

    // Mock data for charts
    const userGrowth = Array.from({ length: 7 }).map((_, i) => ({
      name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.now() - (6 - i) * 86400000).getDay()],
      value: Math.floor(Math.random() * 50) + 10,
    }));

    const revenueGrowth = Array.from({ length: 7 }).map((_, i) => ({
      name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.now() - (6 - i) * 86400000).getDay()],
      value: Math.floor(Math.random() * 5000) + 1000,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        todayUsers,
        freeTrialUsers,
        paidUsers,
        creatorUsers,
        businessUsers,
        agencyUsers,
        todayRevenue,
        monthlyRevenue,
        mrr: monthlyRevenue, // Approximation
        arr: monthlyRevenue * 12, // Approximation
        aiRequestsToday,
        totalAiRequests,
        trialConversion,
        charts: {
          userGrowth,
          revenueGrowth,
        }
      }
    });

  } catch (error) {
    console.error("Admin dashboard API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
