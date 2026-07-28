import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AgencyBranding from "@/models/AgencyBranding";
import { agencyAccess } from "@/lib/agencyAccess";

export async function GET(request) {
  try {
    const auth = await agencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });

    await connectDB();
    let branding = await AgencyBranding.findOne({ agencyId: auth.user._id });
    if (!branding) {
      branding = await AgencyBranding.create({ agencyId: auth.user._id });
    }

    return NextResponse.json({ data: branding }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch branding settings" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await agencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });

    const body = await request.json();
    const { brandName, logoUrl, primaryColor, customDomain } = body;

    await connectDB();
    
    const branding = await AgencyBranding.findOneAndUpdate(
      { agencyId: auth.user._id },
      { $set: { brandName, logoUrl, primaryColor, customDomain } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ data: branding, message: "Branding updated successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update branding" }, { status: 500 });
  }
}
