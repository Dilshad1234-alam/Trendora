import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import AgencyTask from "@/models/AgencyTask";
import AgencyClient from "@/models/AgencyClient";
import AgencyTeam from "@/models/AgencyTeam";
import { agencyAccess } from "@/lib/agencyAccess";
import { checkAgencyPermission } from "@/lib/auth/checkAgencyPermission";

export async function GET(request) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    
    // Anyone in the agency can read tasks.
    const perm = await checkAgencyPermission(auth);
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const assignedTo = searchParams.get("assignedTo");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const query = { agencyId: auth.user._id };

    if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
      query.clientId = clientId;
    }
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = assignedTo;
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const tasks = await AgencyTask.find(query)
      .populate({ path: "clientId", select: "name businessName creatorName clientType", model: AgencyClient })
      .populate({ path: "assignedTo", select: "memberName memberEmail", model: AgencyTeam })
      .sort({ dueDate: 1, createdAt: -1 }) // Sort by due date ascending
      .lean();

    return NextResponse.json({ success: true, data: tasks }, { status: 200 });
  } catch (error) {
    console.error("GET Tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    
    const perm = await checkAgencyPermission(auth);
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    const body = await request.json();
    const { title, description, clientId, assignedTo, priority, dueDate } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Task title is required." }, { status: 400 });
    }

    const taskData = {
      agencyId: auth.user._id,
      title: title.trim(),
      description: description ? description.trim() : "",
      createdBy: auth.user._id, // the user who created it
    };

    if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
      taskData.clientId = clientId;
    }
    
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      taskData.assignedTo = assignedTo;
    }

    if (priority) {
      taskData.priority = priority;
    }

    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    }

    const newTask = await AgencyTask.create(taskData);
    
    // Populate before sending response
    const populatedTask = await AgencyTask.findById(newTask._id)
      .populate({ path: "clientId", select: "name businessName creatorName clientType", model: AgencyClient })
      .populate({ path: "assignedTo", select: "memberName memberEmail", model: AgencyTeam })
      .lean();

    return NextResponse.json({ 
      success: true, 
      message: "Task created successfully.",
      data: populatedTask
    }, { status: 201 });

  } catch (error) {
    console.error("POST Task error:", error);
    return NextResponse.json({ error: "Failed to create task." }, { status: 500 });
  }
}
