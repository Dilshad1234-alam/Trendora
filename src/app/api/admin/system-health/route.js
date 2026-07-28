import { NextResponse } from "next/server";
import { connectDB, isConnected } from "@/lib/db";
import jwt from "jsonwebtoken";
import os from "os";

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

    const dbStatus = isConnected() ? "healthy" : "disconnected";
    
    // Simulate real system metrics or get actual if possible
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);
    
    const cpuLoad = os.loadavg()[0].toFixed(2); // 1 min load avg
    const uptime = os.uptime();

    return NextResponse.json({
      success: true,
      data: {
        database: dbStatus,
        memory: {
          total: totalMemory,
          used: usedMemory,
          free: freeMemory,
          percent: memoryUsagePercent,
        },
        cpu: {
          load: cpuLoad,
          cores: os.cpus().length,
        },
        uptime,
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        status: dbStatus === "healthy" && Number(memoryUsagePercent) < 90 ? "operational" : "degraded",
      }
    });
  } catch (error) {
    console.error("Admin system health API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
