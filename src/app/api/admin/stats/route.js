import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import CreatorProfile from "@/models/CreatorProfile";
import SavedContent from "@/models/SavedContent";
import connectDB from "@/lib/db";

const checkAdminAccess = async () => {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "admin") {
      return { error: "Admin access required.", status: 403 };
    }
    return { user };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

export async function GET() {
  try {
    const auth = await checkAdminAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const totalUsers = await User.countDocuments();
    const totalCreators = await User.countDocuments({ role: "creator" });
    const totalBusinesses = await User.countDocuments({ role: "business" });
    
    const proUsers = await User.countDocuments({ plan: { $in: ["business-pro", "creator-pro"] } });
    const agencyUsers = await User.countDocuments({ plan: "agency" });
    
    const totalContentGenerated = await SavedContent.countDocuments();
    
    const recentSignups = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullname email role plan createdAt");

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalCreators,
        totalBusinesses,
        proUsers,
        agencyUsers,
        totalContentGenerated
      },
      recentSignups
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
