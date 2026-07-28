import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AgencyNotification from "@/models/AgencyNotification";
import { agencyAccess } from "@/lib/agencyAccess";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });

    const { id } = await params;

    const notification = await AgencyNotification.findOneAndUpdate(
      { _id: id, userId: auth.user._id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: notification }, { status: 200 });
  } catch (error) {
    console.error("PATCH read notification error:", error);
    return NextResponse.json({ error: "Failed to update notification." }, { status: 500 });
  }
}
