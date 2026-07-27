import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import AgencyClient from "@/models/AgencyClient";
import { getAuthenticatedAgency } from "@/lib/auth/getAuthenticatedAgency";
import { generateAgencyClientContent } from "@/lib/ai/generateAgencyClientContent";

export async function POST(request) {
  try {
    const auth = await getAuthenticatedAgency();
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
    }

    const { clientId, contentType, formData } = body;

    if (!clientId || !contentType || !formData) {
      return NextResponse.json({ success: false, message: "Missing required fields (clientId, contentType, formData)." }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ success: false, message: "Invalid client ID format." }, { status: 400 });
    }

    await connectDB();

    const client = await AgencyClient.findOne({ _id: clientId, agencyId: auth.user._id });
    
    if (!client) {
      return NextResponse.json({ success: false, message: "Client not found or unauthorized." }, { status: 404 });
    }

    const result = await generateAgencyClientContent({
      agencyUser: auth.user,
      client,
      contentType,
      formData
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: "Content generated successfully.",
      data: result.data
    }, { status: 201 });

  } catch (error) {
    console.error("Agency AI API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
