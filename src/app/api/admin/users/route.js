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

export async function GET(request) {
  try {
    const auth = await checkAdminAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { fullname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .select("fullname email role plan onboardingCompleted createdAt");

    return NextResponse.json({ success: true, users }, { status: 200 });

  } catch (error) {
    console.error("Admin Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await checkAdminAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { userId, role, plan } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role, plan },
      { new: true, runValidators: true }
    ).select("fullname email role plan createdAt");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Admin Update User Error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await checkAdminAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (userId === auth.user._id.toString()) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    // Delete user and associated data
    await User.findByIdAndDelete(userId);
    await BusinessProfile.deleteOne({ user: userId });
    await CreatorProfile.deleteOne({ user: userId });
    await SavedContent.deleteMany({ user: userId });

    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Admin Delete User Error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
