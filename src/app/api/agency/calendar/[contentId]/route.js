import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";
import { agencyAccess } from "@/lib/agencyAccess";
import { checkAgencyPermission } from "@/lib/auth/checkAgencyPermission";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    
    const perm = await checkAgencyPermission(auth);
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    const { contentId } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json({ error: "Invalid content ID." }, { status: 400 });
    }

    const content = await SavedContent.findOne({ _id: contentId, agencyId: auth.user._id });
    if (!content) {
      return NextResponse.json({ error: "Content not found." }, { status: 404 });
    }

    if (body.scheduledFor !== undefined) {
      content.scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
      if (!content.scheduledFor && content.contentStatus === "scheduled") {
        content.contentStatus = "draft"; // Revert to draft if unscheduled
      } else if (content.scheduledFor && content.contentStatus !== "published") {
        content.contentStatus = "scheduled";
        content.pipelineStage = "approved"; // If we rely on legacy pipeline UI
      }
    }

    if (body.contentStatus !== undefined) {
      content.contentStatus = body.contentStatus;
      if (body.contentStatus === "published") {
        content.publishedAt = new Date();
      }
    }

    await content.save();

    return NextResponse.json({ success: true, message: "Calendar content updated successfully.", data: content }, { status: 200 });

  } catch (error) {
    console.error("PATCH Calendar Content error:", error);
    return NextResponse.json({ error: "Failed to update calendar content." }, { status: 500 });
  }
}
