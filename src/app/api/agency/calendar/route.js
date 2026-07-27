import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";
import AgencyClient from "@/models/AgencyClient";
import { getAuthenticatedAgency } from "@/lib/auth/getAuthenticatedAgency";
import { checkAgencyPermission } from "@/lib/auth/checkAgencyPermission";

export async function GET(request) {
  try {
    await connectDB();
    const auth = await getAuthenticatedAgency();
    
    const perm = await checkAgencyPermission(auth);
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const clientType = searchParams.get("clientType");
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");

    // Only content explicitly created for an agency client
    const baseQuery = { agencyId: auth.user._id, clientId: { $ne: null } };

    if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
      baseQuery.clientId = clientId;
    }
    if (clientType) {
      baseQuery.clientType = clientType;
    }
    if (platform) {
      baseQuery.platform = platform;
    }
    if (status) {
      baseQuery.contentStatus = status;
    }

    // 1. Fetch Scheduled Content
    const scheduledQuery = { ...baseQuery, scheduledFor: { $ne: null } };
    const scheduledContent = await SavedContent.find(scheduledQuery)
      .populate({ path: "clientId", select: "name businessName creatorName clientType", model: AgencyClient })
      .lean();

    // 2. Fetch Unscheduled Content (Queue)
    const unscheduledQuery = { ...baseQuery, scheduledFor: null };
    const unscheduledContent = await SavedContent.find(unscheduledQuery)
      .populate({ path: "clientId", select: "name businessName creatorName clientType", model: AgencyClient })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: {
        scheduled: scheduledContent,
        unscheduled: unscheduledContent
      } 
    }, { status: 200 });

  } catch (error) {
    console.error("GET Calendar error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar data." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const auth = await getAuthenticatedAgency();
    
    // Writers might not be allowed to schedule depending on policy, but we'll allow editors and up.
    // Assuming checkAgencyPermission allows full access to owners, let's just check basic access
    const perm = await checkAgencyPermission(auth);
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    const { contentId, scheduledFor } = await request.json();

    if (!contentId || !mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json({ error: "Invalid content ID." }, { status: 400 });
    }

    if (!scheduledFor) {
      return NextResponse.json({ error: "Scheduled date is required." }, { status: 400 });
    }

    const content = await SavedContent.findOne({ _id: contentId, agencyId: auth.user._id });
    if (!content) {
      return NextResponse.json({ error: "Content not found." }, { status: 404 });
    }

    content.scheduledFor = new Date(scheduledFor);
    content.contentStatus = "scheduled";
    // Keep pipelineStage in sync if used
    content.pipelineStage = "approved"; 
    
    await content.save();

    return NextResponse.json({ success: true, message: "Content scheduled successfully.", data: content }, { status: 200 });

  } catch (error) {
    console.error("POST Calendar Schedule error:", error);
    return NextResponse.json({ error: "Failed to schedule content." }, { status: 500 });
  }
}
