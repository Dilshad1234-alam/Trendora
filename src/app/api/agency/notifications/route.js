import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AgencyNotification from "@/models/AgencyNotification";
import { agencyAccess } from "@/lib/agencyAccess";

export async function GET(request) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });

    const notifications = await AgencyNotification.find({ userId: auth.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({ success: true, data: notifications, unreadCount }, { status: 200 });
  } catch (error) {
    console.error("GET Notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications." }, { status: 500 });
  }
}
