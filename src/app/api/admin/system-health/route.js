import { verifyAdmin } from "@/lib/auth/verifyAdmin";
import { NextResponse } from "next/server";
import { connectDB, isConnected } from "@/lib/db";
import jwt from "jsonwebtoken";
import os from "os";

export async function GET(req) {
  try {
    const admin = await verifyAdmin();
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
