import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";
import ContentStatusHistory from "@/models/ContentStatusHistory";
import { agencyAccess } from "@/lib/agencyAccess";
import mongoose from "mongoose";

const VALID_STATUSES = [
  "draft",
  "internal-review",
  "client-review",
  "approved",
  "rejected",
  "scheduled",
  "published"
];

export async function PATCH(request, { params }) {
  try {
    const auth = await agencyAccess();
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const { contentId } = await params;
    
    if (!contentId || !mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json({ success: false, message: "Invalid content ID." }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
    }

    const { status, note } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status provided." }, { status: 400 });
    }

    await connectDB();

    // Verify ownership
    const content = await SavedContent.findOne({ 
      _id: contentId, 
      agencyId: auth.user._id 
    });

    if (!content) {
      return NextResponse.json({ success: false, message: "Content not found or unauthorized." }, { status: 404 });
    }

    const previousStatus = content.contentStatus || "draft";

    if (previousStatus === status) {
      return NextResponse.json({ success: true, message: "Status is already up to date.", data: content }, { status: 200 });
    }

    // Prepare update object
    const updateData = {
      contentStatus: status,
      // Fallback for old pipelines
      pipelineStage: status === "internal-review" || status === "client-review" ? "review" : status
    };

    // Automatically manage date fields based on new status
    const now = new Date();
    if (status === "internal-review" || status === "client-review") {
      updateData.approvalRequestedAt = now;
    } else if (status === "approved") {
      updateData.approvedAt = now;
    } else if (status === "rejected") {
      updateData.rejectedAt = now;
    } else if (status === "published") {
      updateData.publishedAt = now;
    } else if (status === "scheduled") {
      // Typically the UI would pass scheduledFor separately, but we track when it was moved
      // If the model has a general scheduled field, we can update it if needed.
    }

    // Perform update
    const updatedContent = await SavedContent.findByIdAndUpdate(
      contentId,
      { $set: updateData },
      { new: true }
    );

    // Save history
    await ContentStatusHistory.create({
      agencyId: auth.user._id,
      clientId: content.clientId,
      contentId: content._id,
      previousStatus: previousStatus,
      newStatus: status,
      changedBy: auth.user._id,
      note: note || ""
    });

    return NextResponse.json({ 
      success: true, 
      message: "Content status updated successfully.",
      data: {
        id: updatedContent._id,
        status: updatedContent.contentStatus
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Pipeline Update Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
