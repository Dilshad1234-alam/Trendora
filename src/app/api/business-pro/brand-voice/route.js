import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import connectDB from "@/lib/db";

const checkProAccess = async () => {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user || user.plan !== "business-pro") {
      return { error: "Business Pro plan required.", status: 403 };
    }
    return { user };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

export async function GET(request) {
  try {
    const auth = await checkProAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const profile = await BusinessProfile.findOne({ user: auth.user._id });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      brandVoiceTone: profile.brandVoiceTone || "Professional", 
      brandVoiceInstructions: profile.brandVoiceInstructions || "" 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch brand voice settings" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await checkProAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { brandVoiceTone, brandVoiceInstructions } = body;

    const profile = await BusinessProfile.findOneAndUpdate(
      { user: auth.user._id },
      { $set: { brandVoiceTone, brandVoiceInstructions } },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Brand Voice updated successfully.",
      brandVoiceTone: profile.brandVoiceTone, 
      brandVoiceInstructions: profile.brandVoiceInstructions 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update brand voice" }, { status: 500 });
  }
}
