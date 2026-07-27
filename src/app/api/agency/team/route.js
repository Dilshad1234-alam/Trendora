import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import connectDB from "@/lib/db";
import AgencyTeam from "@/models/AgencyTeam";

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
    const team = await AgencyTeam.find({ agencyId: auth.user._id }).sort({ createdAt: -1 });

    return NextResponse.json({ data: team }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await checkAgencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { memberName, memberEmail, role } = body;

    if (!memberName || !memberEmail) {
      return NextResponse.json({ error: "Member name and email are required" }, { status: 400 });
    }

    await connectDB();
    const existing = await AgencyTeam.findOne({ agencyId: auth.user._id, memberEmail });
    if (existing) {
      return NextResponse.json({ error: "Team member already exists" }, { status: 400 });
    }

    const newMember = await AgencyTeam.create({
      agencyId: auth.user._id,
      memberName,
      memberEmail,
      role: role || "editor",
      status: "invited",
    });

    return NextResponse.json({ data: newMember, message: "Team member invited successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to invite team member" }, { status: 500 });
  }
}
