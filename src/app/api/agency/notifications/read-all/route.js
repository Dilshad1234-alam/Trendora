import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AgencyNotification from "@/models/AgencyNotification";
import { getAuthenticatedAgency } from "@/lib/auth/getAuthenticatedAgency";

export async function PATCH(request) {
  try {
    await connectDB();
    const auth = await getAuthenticatedAgency();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    await AgencyNotification.updateMany(
      { userId: auth.user._id, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ success: true, message: "All notifications marked as read." }, { status: 200 });
  } catch (error) {
    console.error("PATCH read-all error:", error);
    return NextResponse.json({ error: "Failed to update notifications." }, { status: 500 });
  }
}
