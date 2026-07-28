import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import AgencyClient from "@/models/AgencyClient";
import { agencyAccess } from "@/lib/agencyAccess";

export async function POST(request, { params }) {
  try {
    const auth = await agencyAccess();
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ success: false, message: "Invalid client ID format" }, { status: 400 });
    }

    await connectDB();
    
    // Restore from archived
    const restoredClient = await AgencyClient.findOneAndUpdate(
      { _id: clientId, agencyId: auth.user._id, status: "archived" },
      { $set: { status: "active" } },
      { new: true }
    );

    if (!restoredClient) {
      return NextResponse.json({ success: false, message: "Archived client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Client restored successfully", data: restoredClient }, { status: 200 });
  } catch (error) {
    console.error("Restore client error:", error);
    return NextResponse.json({ success: false, message: "Failed to restore client" }, { status: 500 });
  }
}
