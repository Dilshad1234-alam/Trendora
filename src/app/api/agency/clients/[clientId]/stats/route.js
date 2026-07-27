import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";
import AgencyClient from "@/models/AgencyClient";
import { getAuthenticatedAgency } from "@/lib/auth/getAuthenticatedAgency";

export async function GET(request, { params }) {
  try {
    const auth = await getAuthenticatedAgency();
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ success: false, message: "Invalid client ID format" }, { status: 400 });
    }

    await connectDB();
    
    // Validate ownership of the client
    const client = await AgencyClient.findOne({ _id: clientId, agencyId: auth.user._id });
    if (!client) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalContent,
      draftContent,
      pendingApproval,
      approvedContent,
      publishedContent,
      thisMonthContent,
      recentActivity
    ] = await Promise.all([
      SavedContent.countDocuments({ clientId: client._id, agencyId: auth.user._id }),
      SavedContent.countDocuments({ clientId: client._id, agencyId: auth.user._id, pipelineStage: { $in: ["drafted", "draft"] } }),
      SavedContent.countDocuments({ clientId: client._id, agencyId: auth.user._id, pipelineStage: { $in: ["internal-review", "review", "client-review"] } }),
      SavedContent.countDocuments({ clientId: client._id, agencyId: auth.user._id, pipelineStage: "approved" }),
      SavedContent.countDocuments({ clientId: client._id, agencyId: auth.user._id, pipelineStage: "published" }),
      SavedContent.countDocuments({ clientId: client._id, agencyId: auth.user._id, createdAt: { $gte: startOfMonth } }),
      SavedContent.find({ clientId: client._id, agencyId: auth.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title type pipelineStage platform createdAt")
    ]);

    const stats = {
      total: totalContent,
      draft: draftContent,
      pending: pendingApproval,
      approved: approvedContent,
      published: publishedContent,
      thisMonth: thisMonthContent,
      recentActivity
    };

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error) {
    console.error("Fetch client stats error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch client stats" }, { status: 500 });
  }
}
