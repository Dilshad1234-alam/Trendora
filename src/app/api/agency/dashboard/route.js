import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import SavedContent from "@/models/SavedContent";

export async function GET(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    if (user.plan !== "agency") {
      return NextResponse.json(
        { error: "This endpoint requires an Agency subscription." },
        { status: 403 }
      );
    }

    // Fetch dashboard stats for agency (all content created by this agency user)
    const savedContents = await SavedContent.find({
      user: user._id
    });

    const creatorPosts = savedContents.filter((item) => item.type === "creator-post" || item.type === "post").length;
    const businessPosts = savedContents.filter((item) => item.type === "business-post").length;
    const scripts = savedContents.filter((item) => item.type === "script").length;
    const adCopies = savedContents.filter((item) => item.type === "ad-copy").length;
    
    const recentSavedContents = savedContents
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Placeholder data for Agency specific features
    const activeClients = 3;
    const teamMembers = 2;
    const aiGenerationsThisMonth = 1248;

    return NextResponse.json({
      message: "Agency Dashboard Data",
      data: {
        user: {
          name: user.name || user.fullname,
          email: user.email,
          plan: user.plan,
        },
        stats: {
          creatorPosts,
          businessPosts,
          scripts,
          adCopies,
          activeClients,
          teamMembers,
          aiGenerationsThisMonth,
          totalSavedContents: savedContents.length,
          unlimitedGenerations: true,
        },
        recentSavedContents,
      },
    });
  } catch (error) {
    console.error("Agency Dashboard API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
