import { verifyAdmin } from "@/lib/auth/verifyAdmin";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import GeneratedContent from "@/models/GeneratedContent";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalRequests,
      todayRequests,
    ] = await Promise.all([
      GeneratedContent.countDocuments(),
      GeneratedContent.countDocuments({ createdAt: { $gte: today } }),
    ]);

    // Group by content type (hook, script, ad-copy etc)
    const usageByType = await GeneratedContent.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Calculate simulated breakdown for models since we don't track the exact model used yet
    const geminiUsage = Math.floor(totalRequests * 0.95);
    const openaiUsage = Math.floor(totalRequests * 0.05);
    const claudeUsage = 0;
    const groqUsage = 0;

    return NextResponse.json({
      success: true,
      data: {
        totalRequests,
        todayRequests,
        averageResponseTime: "1.2s", // Mocked
        failedRequests: Math.floor(totalRequests * 0.02), // Mocked 2% failure
        rateLimitErrors: 12, // Mocked 429s
        averageTokens: 450, // Mocked
        providers: {
          gemini: geminiUsage,
          openai: openaiUsage,
          claude: claudeUsage,
          groq: groqUsage,
        },
        usageByType: usageByType.map(item => ({
          type: item._id,
          count: item.count
        }))
      }
    });

  } catch (error) {
    console.error("Admin AI analytics API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
