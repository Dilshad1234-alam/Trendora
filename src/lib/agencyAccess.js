import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";

export const agencyAccess = async () => {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Unauthorized. Please login first.",
        status: 401,
      };
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return {
        success: false,
        error: "Invalid or expired token.",
        status: 401,
      };
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return {
        success: false,
        error: "User not found.",
        status: 404,
      };
    }

    // Admins always have access
    if (user.role === "admin") {
      return { success: true, user };
    }

    // Paid Agency users have access
    if (user.plan === "agency") {
      return { success: true, user };
    }

    // Check for Agency free trial
    if (user.plan === "free" && user.workspace === "agency") {
      const now = new Date();
      if (user.trialEndsAt && new Date(user.trialEndsAt) > now) {
        // Trial is active
        return {
          success: true,
          user,
          trialActive: true,
        };
      } else {
        // Trial has expired
        return {
          success: false,
          code: "TRIAL_EXPIRED",
          error: "Your free trial has expired.",
          redirectTo: "/onboarding/select-plan?recommended=agency",
          status: 403,
        };
      }
    }

    // Any other user (Creator, Business without Agency plan)
    return {
      success: false,
      error: "Unauthorized access. Agency subscription required.",
      status: 403,
      upgradeRequired: true,
    };
  } catch (error) {
    console.error("Agency Access Error:", error);
    return {
      success: false,
      error: "Internal server error during authentication.",
      status: 500,
    };
  }
};
