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

    if (user.plan !== "creator-pro") {
      return NextResponse.json(
        { error: "This endpoint requires a Creator Pro subscription." },
        { status: 403 }
      );
    }

    // Fetch dashboard stats for creator-pro
    const savedContents = await SavedContent.find({
      userId: user._id,
    });

    const hooks = savedContents.filter((item) => item.type === "hook").length;
    const scripts = savedContents.filter((item) => item.type === "script").length;
    const captions = savedContents.filter((item) => item.type === "caption").length;
    const hashtags = savedContents.filter((item) => item.type === "hashtag").length;
    const thumbnailTitles = savedContents.filter((item) => item.type === "thumbnail-title").length;
    const videoDescriptions = savedContents.filter((item) => item.type === "video-description").length;

    const recentSavedContents = savedContents
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return NextResponse.json({
      message: "Creator Pro Dashboard Data",
      data: {
        user: {
          name: user.name,
          email: user.email,
          plan: user.plan,
        },
        stats: {
          hooks,
          scripts,
          captions,
          hashtags,
          thumbnailTitles,
          videoDescriptions,
          totalSavedContents: savedContents.length,
          unlimitedGenerations: true,
        },
        recentSavedContents,
      },
    });
  } catch (error) {
    console.error("Creator Pro Dashboard API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
