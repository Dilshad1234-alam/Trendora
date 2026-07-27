import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";

const checkAgencyAccess = async () => {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user || user.plan !== "agency") {
      return { error: "Unauthorized access. Agency plan required.", status: 403 };
    }
    return { user };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

export async function GET(request) {
  try {
    const auth = await checkAgencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    await connectDB();
    // Fetch all content created by this agency user
    const savedContent = await SavedContent.find({ user: auth.user._id }).sort({ createdAt: -1 });

    return NextResponse.json({ data: savedContent }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch saved content" }, { status: 500 });
  }
}
