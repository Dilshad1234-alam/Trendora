import AgencyTeam from "@/models/AgencyTeam";

/**
 * Validates if the authenticated user has the required permission for the agency.
 * @param {Object} authResult - The object returned by getAuthenticatedAgency()
 * @param {String} requiredPermission - The permission string required (e.g. "manage_team")
 * @returns {Object} { success: boolean, role: string, message: string, status: number }
 */
export async function checkAgencyPermission(authResult, requiredPermission = null) {
  if (!authResult || authResult.error) {
    return { success: false, message: authResult?.error || "Unauthorized", status: authResult?.status || 401 };
  }

  const { user } = authResult;
  const agencyId = user._id; // The main agency ID we operate under for standalone owners

  // 1. Is the current user the primary Agency Owner?
  // We determine this if they have the 'agency' plan or if they are on an active agency free trial
  if (user.plan === "agency" || user.workspace === "agency") {
    // If no specific permission is required, they pass.
    // Owners have 'full_access'.
    return { success: true, role: "owner" };
  }

  // 2. Are they a Team Member?
  // (In a multi-tenant setup, we'd check their AgencyTeam record for the target agencyId.
  // For now, assume if they are NOT the owner, they must exist in AgencyTeam)
  const teamMember = await AgencyTeam.findOne({ userId: user._id, status: "active" });

  if (!teamMember) {
    return { success: false, message: "You are not an active member of this agency.", status: 403 };
  }

  if (teamMember.role === "owner" || teamMember.permissions.includes("full_access")) {
    return { success: true, role: "owner", memberId: teamMember._id };
  }

  if (requiredPermission) {
    if (!teamMember.permissions.includes(requiredPermission)) {
      return { 
        success: false, 
        message: `Forbidden: Requires '${requiredPermission}' permission.`, 
        status: 403 
      };
    }
  }

  return { success: true, role: teamMember.role, memberId: teamMember._id };
}
