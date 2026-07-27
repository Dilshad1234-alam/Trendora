import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AgencyTeam from "@/models/AgencyTeam";
import { getAuthenticatedAgency } from "@/lib/auth/getAuthenticatedAgency";
import { checkAgencyPermission } from "@/lib/auth/checkAgencyPermission";

export async function GET(request) {
  try {
    await connectDB();
    const auth = await getAuthenticatedAgency();
    
    // In a full multi-tenant system, any member could fetch the team list if they have 'manage_team' or 'read_team'.
    // For now, the owner always passes checkAgencyPermission.
    const perm = await checkAgencyPermission(auth);
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    // Since we don't have a dedicated read_team permission in the prompt, we'll allow members to see the team 
    // or limit it to owner/admin. Let's return all members for this agency.
    const members = await AgencyTeam.find({ agencyId: auth.user._id })
      .select("-invitationTokenHash") // Never leak hashes
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: members }, { status: 200 });

  } catch (error) {
    console.error("GET Agency Team error:", error);
    return NextResponse.json({ error: "Failed to fetch team members." }, { status: 500 });
  }
}
