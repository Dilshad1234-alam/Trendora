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

    if (user.plan !== "business-pro") {
      return NextResponse.json(
        { error: "This endpoint requires a Business Pro subscription." },
        { status: 403 }
      );
    }

    // Fetch dashboard stats for business-pro
    const savedContents = await SavedContent.find({
      user: user._id,
      ownerType: "business"
    });

    const posts = savedContents.filter((item) => item.type === "business-post").length;
    const captions = savedContents.filter((item) => item.type === "business-caption").length;
    const hashtags = savedContents.filter((item) => item.type === "business-hashtag").length;
    const adCopies = savedContents.filter((item) => item.type === "ad-copy").length;
    const localSeo = savedContents.filter((item) => item.type === "local-seo").length;
    const reviewReplies = savedContents.filter((item) => item.type === "review-reply").length;
    const whatsappReplies = savedContents.filter((item) => item.type === "whatsapp-reply").length;

    const recentSavedContents = savedContents
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return NextResponse.json({
      message: "Business Pro Dashboard Data",
      data: {
        user: {
          name: user.name,
          email: user.email,
          plan: user.plan,
        },
        stats: {
          posts,
          captions,
          hashtags,
          adCopies,
          localSeo,
          reviewReplies,
          whatsappReplies,
          totalSavedContents: savedContents.length,
          unlimitedGenerations: true,
        },
        recentSavedContents,
      },
    });
  } catch (error) {
    console.error("Business Pro Dashboard API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
