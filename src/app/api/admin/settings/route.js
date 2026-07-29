import { verifyAdmin } from "@/lib/auth/verifyAdmin";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SystemSettings from "@/models/SystemSettings";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const admin = await verifyAdmin();
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
    const admin = await verifyAdmin();
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
