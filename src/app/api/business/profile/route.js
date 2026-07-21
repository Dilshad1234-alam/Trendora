import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";

const getAuthenticatedBusiness = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      error: "Unauthorized. Please login first.",
      status: 401,
    };
  }

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch {
    return {
      error: "Invalid or expired token.",
      status: 401,
    };
  }

  const user = await User.findById(decoded.userId).lean();

  if (!user) {
    return {
      error: "User not found.",
      status: 404,
    };
  }

  if (user.role !== "business") {
    return {
      error: "Only business users can access this resource.",
      status: 403,
    };
  }

  if (!user.onboardingCompleted) {
    return {
      error: "Please complete business onboarding first.",
      status: 403,
    };
  }

  const now = new Date();

  const trialEndsAt = user.trialEndsAt
    ? new Date(user.trialEndsAt)
    : null;

  const trialExpired =
    !user.planSelected &&
    trialEndsAt &&
    now >= trialEndsAt;

  // Sirf trial expire hone ke baad block karo
  if (trialExpired) {
    return {
      error: "Please select a plan first.",
      status: 403,
    };
  }

  return {
    user,
  };
};

export async function GET() {
  try {
    await connectDB();

    const auth = await getAuthenticatedBusiness();

    if (auth.error) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error,
        },
        {
          status: auth.status,
        }
      );
    }

    const profile = await BusinessProfile.findOne({
      user: auth.user._id,
    }).lean();

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "Business profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Business profile fetched successfully.",
        data: {
          id: profile._id.toString(),
          businessName: profile.businessName,
          businessType: profile.businessType,
          city: profile.city,
          services: profile.services || [],
          targetCustomers: profile.targetCustomers || "",
          goal: profile.goal,
          onlinePresence: profile.onlinePresence || "",
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Business profile GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch business profile.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}