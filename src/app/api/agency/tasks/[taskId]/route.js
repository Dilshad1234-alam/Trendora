import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import AgencyTask from "@/models/AgencyTask";
import AgencyClient from "@/models/AgencyClient";
import AgencyTeam from "@/models/AgencyTeam";
import SavedContent from "@/models/SavedContent";
import { agencyAccess } from "@/lib/agencyAccess";
import { checkAgencyPermission } from "@/lib/auth/checkAgencyPermission";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    
    const perm = await checkAgencyPermission(auth);
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    const { taskId } = await params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json({ error: "Invalid task ID." }, { status: 400 });
    }

    const task = await AgencyTask.findOne({ _id: taskId, agencyId: auth.user._id })
      .populate({ path: "clientId", select: "name businessName creatorName clientType", model: AgencyClient })
      .populate({ path: "assignedTo", select: "memberName memberEmail", model: AgencyTeam })
      .populate({ path: "contentId", select: "title type", model: SavedContent })
      .lean();

    if (!task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task }, { status: 200 });

  } catch (error) {
    console.error("GET Task error:", error);
    return NextResponse.json({ error: "Failed to fetch task." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    
    const perm = await checkAgencyPermission(auth);
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    const { taskId } = await params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json({ error: "Invalid task ID." }, { status: 400 });
    }

    const body = await request.json();
    const updateData = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.priority) updateData.priority = body.priority;
    
    if (body.status) {
      updateData.status = body.status;
      if (body.status === "completed") {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    if (body.clientId !== undefined) {
      updateData.clientId = body.clientId ? body.clientId : null;
    }

    if (body.assignedTo !== undefined) {
      updateData.assignedTo = body.assignedTo ? body.assignedTo : null;
    }
    
    if (body.contentId !== undefined) {
      updateData.contentId = body.contentId ? body.contentId : null;
    }

    const updatedTask = await AgencyTask.findOneAndUpdate(
      { _id: taskId, agencyId: auth.user._id },
      { $set: updateData },
      { new: true }
    )
    .populate({ path: "clientId", select: "name businessName creatorName clientType", model: AgencyClient })
    .populate({ path: "assignedTo", select: "memberName memberEmail", model: AgencyTeam })
    .lean();

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Task updated successfully.", data: updatedTask }, { status: 200 });

  } catch (error) {
    console.error("PATCH Task error:", error);
    return NextResponse.json({ error: "Failed to update task." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    
    // Only admins or owners can delete tasks
    const perm = await checkAgencyPermission(auth, "manage_team"); // Requires admin level
    if (!perm.success && perm.role !== "owner") {
      return NextResponse.json({ error: "Only admins and owners can delete tasks." }, { status: 403 });
    }

    const { taskId } = await params;

    const task = await AgencyTask.findOneAndDelete({ _id: taskId, agencyId: auth.user._id });

    if (!task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Task deleted successfully." }, { status: 200 });

  } catch (error) {
    console.error("DELETE Task error:", error);
    return NextResponse.json({ error: "Failed to delete task." }, { status: 500 });
  }
}
