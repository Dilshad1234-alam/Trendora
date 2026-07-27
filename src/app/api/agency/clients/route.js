import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import connectDB from "@/lib/db";
import AgencyClient from "@/models/AgencyClient";

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
    const clients = await AgencyClient.find({ agencyId: auth.user._id }).sort({ createdAt: -1 });

    return NextResponse.json({ data: clients }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await checkAgencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { name, email, company, notes, status, brandVoice, targetAudience, customRules } = body;

    if (!name) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }

    await connectDB();
    const newClient = await AgencyClient.create({
      agencyId: auth.user._id,
      name,
      email,
      company,
      notes,
      brandVoice,
      targetAudience,
      customRules,
      status: status || "active",
    });

    return NextResponse.json({ data: newClient, message: "Client added successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 });
  }
}
