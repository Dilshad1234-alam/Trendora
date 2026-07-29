import { verifyAdmin } from "@/lib/auth/verifyAdmin";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
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

    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    // Mock data if no subscriptions exist yet to satisfy layout
    const [
      todayRevObj,
      weekRevObj,
      monthRevObj,
      yearRevObj,
      mrrObj,
      agencyRevObj,
      creatorRevObj,
      businessRevObj
    ] = await Promise.all([
      Subscription.aggregate([{ $match: { createdAt: { $gte: today }, status: "active" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Subscription.aggregate([{ $match: { createdAt: { $gte: firstDayOfWeek }, status: "active" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Subscription.aggregate([{ $match: { createdAt: { $gte: firstDayOfMonth }, status: "active" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Subscription.aggregate([{ $match: { createdAt: { $gte: firstDayOfYear }, status: "active" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Subscription.aggregate([{ $match: { status: "active", billingCycle: "monthly" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Subscription.aggregate([{ $match: { status: "active", plan: "agency" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Subscription.aggregate([{ $match: { status: "active", plan: "creator-pro" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Subscription.aggregate([{ $match: { status: "active", plan: "business-pro" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    const todayRev = todayRevObj[0]?.total || 0;
    const weekRev = weekRevObj[0]?.total || 0;
    const monthRev = monthRevObj[0]?.total || 0;
    const yearRev = yearRevObj[0]?.total || 0;
    const mrr = mrrObj[0]?.total || 0;
    const arr = mrr * 12;

    const agencyRev = agencyRevObj[0]?.total || 0;
    const creatorRev = creatorRevObj[0]?.total || 0;
    const businessRev = businessRevObj[0]?.total || 0;

    const totalSubscribers = await Subscription.countDocuments({ status: "active" });
    const arpu = totalSubscribers > 0 ? (mrr / totalSubscribers).toFixed(2) : 0;

    return NextResponse.json({
      success: true,
      data: {
        today: todayRev,
        weekly: weekRev,
        monthly: monthRev,
        yearly: yearRev,
        mrr,
        arr,
        arpu,
        breakdown: {
          agency: agencyRev,
          creator: creatorRev,
          business: businessRev,
        }
      }
    });

  } catch (error) {
    console.error("Admin revenue API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
