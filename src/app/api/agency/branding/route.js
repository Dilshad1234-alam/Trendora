import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import connectDB from "@/lib/db";
import AgencyBranding from "@/models/AgencyBranding";

const checkAgencyAccess = async () => {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user || user.plan !== "agency") {
      return { error: "Unauthorized access. Agency plan required.", status: 403 };
    }
    return { user };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

export async function GET(request) {
  try {
    const auth = await checkAgencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

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
    const auth = await checkAgencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

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
