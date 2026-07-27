import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";

export const getAuthenticatedAgency = async () => {
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

    if (user.plan !== "agency" && user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized access. Agency subscription required.",
        status: 403,
        upgradeRequired: true,
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Agency Auth Error:", error);
    return {
      success: false,
      error: "Internal server error during authentication.",
      status: 500,
    };
  }
};
