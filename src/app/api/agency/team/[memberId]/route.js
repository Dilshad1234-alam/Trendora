import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AgencyTeam from "@/models/AgencyTeam";
import { getAuthenticatedAgency } from "@/lib/auth/getAuthenticatedAgency";
import { checkAgencyPermission } from "@/lib/auth/checkAgencyPermission";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const auth = await getAuthenticatedAgency();
    
    const perm = await checkAgencyPermission(auth, "manage_team");
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    const { memberId } = await params;
    const { role, status } = await request.json();

    const member = await AgencyTeam.findOne({ _id: memberId, agencyId: auth.user._id });
    
    if (!member) {
      return NextResponse.json({ error: "Team member not found." }, { status: 404 });
    }

    // Protection: Prevent modifying the owner
    if (member.role === "owner" || (member.userId && member.userId.toString() === auth.user._id.toString())) {
      return NextResponse.json({ error: "Cannot modify the agency owner." }, { status: 403 });
    }

    if (role) {
      const validRoles = ["admin", "editor", "writer", "viewer"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role selected." }, { status: 400 });
      }
      member.role = role;
    }

    if (status) {
      const validStatuses = ["active", "disabled"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status selected." }, { status: 400 });
      }
      member.status = status;
    }

    await member.save();

    return NextResponse.json({ success: true, message: "Team member updated successfully." }, { status: 200 });

  } catch (error) {
    console.error("PATCH Team Member error:", error);
    return NextResponse.json({ error: "Failed to update team member." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const auth = await getAuthenticatedAgency();
    
    const perm = await checkAgencyPermission(auth, "manage_team");
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    const { memberId } = await params;

    const member = await AgencyTeam.findOne({ _id: memberId, agencyId: auth.user._id });
    
    if (!member) {
      return NextResponse.json({ error: "Team member not found." }, { status: 404 });
    }

    // Protection: Prevent deleting the owner
    if (member.role === "owner" || (member.userId && member.userId.toString() === auth.user._id.toString())) {
      return NextResponse.json({ error: "Cannot remove the agency owner." }, { status: 403 });
    }

    await AgencyTeam.deleteOne({ _id: memberId });

    return NextResponse.json({ success: true, message: "Team member removed successfully." }, { status: 200 });

  } catch (error) {
    console.error("DELETE Team Member error:", error);
    return NextResponse.json({ error: "Failed to remove team member." }, { status: 500 });
  }
}
