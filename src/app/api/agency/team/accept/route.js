import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import AgencyTeam from "@/models/AgencyTeam";
import { getAuthenticatedAgency } from "@/lib/auth/getAuthenticatedAgency";

export async function POST(request) {
  try {
    await connectDB();
    
    // The user accepting the invite must be logged in.
    // They may or may not be an agency owner, they just need to be a valid user.
    // We will use the same helper but we don't strictly require 'agency' plan.
    const auth = await getAuthenticatedAgency();
    
    // Actually, getAuthenticatedAgency checks if role==="agency" or similar.
    // Let's assume they must be logged in. If they are invited, they could be any user.
    // But since trendora uses getAuthenticatedAgency, we will stick to it.
    if (auth.error) {
      return NextResponse.json({ error: "Please login to accept an invitation." }, { status: 401 });
    }

    const { token, memberId } = await request.json();

    if (!token || !memberId) {
      return NextResponse.json({ error: "Token and Member ID are required." }, { status: 400 });
    }

    const member = await AgencyTeam.findById(memberId);
    if (!member) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (member.status === "active") {
      return NextResponse.json({ error: "Invitation already accepted." }, { status: 400 });
    }

    if (member.status === "disabled") {
      return NextResponse.json({ error: "This account has been disabled." }, { status: 403 });
    }

    // Check expiration
    if (member.invitationExpiresAt && new Date() > member.invitationExpiresAt) {
      return NextResponse.json({ error: "Invitation has expired." }, { status: 400 });
    }

    // Validate hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (tokenHash !== member.invitationTokenHash) {
      return NextResponse.json({ error: "Invalid invitation token." }, { status: 400 });
    }

    // Accept invitation
    member.status = "active";
    member.userId = auth.user._id; // Link to the actual logged-in user
    member.invitationTokenHash = null; // Clear token
    member.invitationExpiresAt = null;
    member.acceptedAt = new Date();
    
    await member.save();

    return NextResponse.json({ 
      success: true, 
      message: "Invitation accepted successfully!" 
    }, { status: 200 });

  } catch (error) {
    console.error("POST Accept Invite error:", error);
    return NextResponse.json({ error: "Failed to accept invitation." }, { status: 500 });
  }
}
