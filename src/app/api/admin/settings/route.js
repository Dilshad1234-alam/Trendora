import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SystemSettings from "@/models/SystemSettings";
import jwt from "jsonwebtoken";

const verifyAdmin = (request) => {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return null;
    return decoded;
  } catch (error) {
    return null;
  }
};

export async function GET(req) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const settings = await SystemSettings.find({});
    
    // Transform into a key-value object
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: settingsMap
    });

  } catch (error) {
    console.error("Admin settings API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const updates = Object.keys(body).map(async (key) => {
      return SystemSettings.findOneAndUpdate(
        { key },
        { value: body[key], updatedBy: admin.id },
        { upsert: true, new: true }
      );
    });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully"
    });

  } catch (error) {
    console.error("Admin settings API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
