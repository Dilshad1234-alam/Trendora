import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { agencyAccess } from "@/lib/agencyAccess";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyTeam from "@/models/AgencyTeam";
import AgencyClient from "@/models/AgencyClient";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const auth = await agencyAccess();
    
    // We allow users with pending setup to access this GET route
    if (auth.error && auth.status !== 403) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    if (!auth.user || auth.user.plan !== "agency") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 403 }
      );
    }

    const profile = await AgencyProfile.findOne({ agencyId: auth.user._id });

    return NextResponse.json(
      {
        success: true,
        data: profile || {},
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Agency Setup GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch agency setup info." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    
    // We allow users with pending setup to access this POST route
    if (auth.error && auth.status !== 403) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    if (!auth.user || auth.user.plan !== "agency") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON data." },
        { status: 400 }
      );
    }

    const {
      agencyName,
      logoUrl,
      website,
      businessEmail,
      phone,
      city,
      country,
      description,
      primaryColor,
      secondaryColor,
      teamMemberName,
      teamMemberEmail,
      clientName,
      clientEmail,
      clientType
    } = body;

    if (!agencyName || typeof agencyName !== "string" || !agencyName.trim()) {
      return NextResponse.json(
        { success: false, message: "Agency Name is required." },
        { status: 400 }
      );
    }

    // Upsert AgencyProfile
    const profile = await AgencyProfile.findOneAndUpdate(
      { agencyId: auth.user._id },
      {
        agencyName: agencyName.trim(),
        logoUrl: logoUrl || "",
        website: website || "",
        businessEmail: businessEmail || "",
        phone: phone || "",
        city: city || "",
        country: country || "",
        description: description || "",
        primaryColor: primaryColor || "#7c3aed",
        secondaryColor: secondaryColor || "#c4b5fd",
      },
      { new: true, upsert: true }
    );

    // Optional Team Member
    if (teamMemberName && teamMemberEmail) {
      const existingTeam = await AgencyTeam.findOne({
        agencyId: auth.user._id,
        memberEmail: teamMemberEmail.toLowerCase().trim()
      });
      if (!existingTeam) {
        await AgencyTeam.create({
          agencyId: auth.user._id,
          memberName: teamMemberName.trim(),
          memberEmail: teamMemberEmail.toLowerCase().trim(),
          role: "editor",
          status: "active" // Simplified for onboarding
        });
      }
    }

    // Optional First Client
    if (clientName) {
      const existingClient = await AgencyClient.findOne({
        agencyId: auth.user._id,
        name: clientName.trim()
      });
      
      if (!existingClient) {
        await AgencyClient.create({
          agencyId: auth.user._id,
          name: clientName.trim(),
          email: clientEmail ? clientEmail.toLowerCase().trim() : "",
          clientType: clientType || "business", // defaults to business
          status: "active"
        });
      }
    }

    // Update User Onboarding Status
    if (!auth.user.agencyOnboardingCompleted) {
      await User.updateOne(
        { _id: auth.user._id },
        { $set: { agencyOnboardingCompleted: true } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Agency setup completed successfully.",
        nextRoute: "/agency/dashboard",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Agency Setup POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to complete agency setup." },
      { status: 500 }
    );
  }
}
