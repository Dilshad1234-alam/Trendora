import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import AgencyTeam from "@/models/AgencyTeam";
import { getAuthenticatedAgency } from "@/lib/auth/getAuthenticatedAgency";
import { checkAgencyPermission } from "@/lib/auth/checkAgencyPermission";

export async function POST(request) {
  try {
    await connectDB();
    const auth = await getAuthenticatedAgency();
    
    const perm = await checkAgencyPermission(auth, "manage_team");
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    const { memberEmail, memberName, role } = await request.json();

    if (!memberEmail || !memberName || !role) {
      return NextResponse.json({ error: "Email, name, and role are required." }, { status: 400 });
    }

    const validRoles = ["admin", "editor", "writer", "viewer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role selected." }, { status: 400 });
    }

    // Generate secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    
    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    let newMember = await AgencyTeam.findOne({ 
      agencyId: auth.user._id, 
      memberEmail: memberEmail.toLowerCase() 
    });

    if (newMember) {
      if (newMember.status !== "invited") {
        return NextResponse.json({ error: "A member with this email already exists and is active or disabled." }, { status: 400 });
      }
      // Regenerate token for existing invited member
      newMember.memberName = memberName;
      newMember.role = role;
      newMember.invitationTokenHash = tokenHash;
      newMember.invitationExpiresAt = expiresAt;
      await newMember.save();
    } else {
      newMember = await AgencyTeam.create({
        agencyId: auth.user._id,
        memberName,
        memberEmail: memberEmail.toLowerCase(),
        role,
        status: "invited",
        invitedBy: auth.user._id,
        invitationTokenHash: tokenHash,
        invitationExpiresAt: expiresAt
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Invitation generated.",
      data: {
        member: {
          id: newMember._id,
          name: newMember.memberName,
          email: newMember.memberEmail,
          role: newMember.role,
          status: newMember.status,
          createdAt: newMember.createdAt
        },
        // In a real app, this would be emailed via Resend/SendGrid and NEVER returned in the API response.
        // Returning it here for UI demonstration purposes as requested.
        invitationLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/agency/team/accept?token=${rawToken}&id=${newMember._id}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error("POST Invite Member error:", error);
    return NextResponse.json({ error: "Failed to invite member." }, { status: 500 });
  }
}
