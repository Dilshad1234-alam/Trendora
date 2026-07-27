import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
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
    const client = await AgencyClient.findOne({ _id: clientId, agencyId: auth.user._id });

    if (!client) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: client }, { status: 200 });
  } catch (error) {
    console.error("Fetch client error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch client" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await getAuthenticatedAgency();
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ success: false, message: "Invalid client ID format" }, { status: 400 });
    }

    const body = await request.json();
    
    // Prevent agencyId override
    if (body.agencyId) {
      delete body.agencyId;
    }

    // Validate email if present
    if (body.email && !/^\S+@\S+\.\S+$/.test(body.email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 });
    }

    if (body.name && (!typeof body.name === "string" || !body.name.trim())) {
      return NextResponse.json({ success: false, message: "Client name is required" }, { status: 400 });
    }
    if (body.name) body.name = body.name.trim();

    // Type and status validation
    if (body.clientType && !["creator", "business"].includes(body.clientType)) {
      delete body.clientType;
    }
    if (body.status && !["active", "inactive", "lead", "paused", "archived"].includes(body.status)) {
      delete body.status;
    }

    await connectDB();
    const updatedClient = await AgencyClient.findOneAndUpdate(
      { _id: clientId, agencyId: auth.user._id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedClient, message: "Client updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Update client error:", error);
    return NextResponse.json({ success: false, message: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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
    
    // Soft delete: change status to archived
    const deletedClient = await AgencyClient.findOneAndUpdate(
      { _id: clientId, agencyId: auth.user._id },
      { $set: { status: "archived" } },
      { new: true }
    );

    if (!deletedClient) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Client archived successfully", data: deletedClient }, { status: 200 });
  } catch (error) {
    console.error("Archive client error:", error);
    return NextResponse.json({ success: false, message: "Failed to archive client" }, { status: 500 });
  }
}
