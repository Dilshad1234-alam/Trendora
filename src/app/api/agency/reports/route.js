import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";
import { agencyAccess } from "@/lib/agencyAccess";

export async function POST(request) {
  try {
    const auth = await agencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });

    const { client, dateRange } = await request.json();

    await connectDB();
    
    // In a full implementation, you would filter by `client` (clientId) and `dateRange`.
    // Currently SavedContent doesn't store clientId directly, so we'll fetch all.
    const savedContents = await SavedContent.find({ user: auth.user._id });
    
    const totalAssets = savedContents.length;
    
    // Estimate: each AI generation saves approx 0.8 hours of manual work (drafting, editing)
    const hoursSaved = Math.round(totalAssets * 0.8);
    
    // Calculate breakdown by content type
    const breakdownMap = {};
    savedContents.forEach(item => {
      // capitalize and replace hyphens
      const typeStr = item.type.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
      breakdownMap[typeStr] = (breakdownMap[typeStr] || 0) + 1;
    });
    
    const breakdown = Object.keys(breakdownMap).map(key => ({
      name: key,
      val: breakdownMap[key]
    })).sort((a, b) => b.val - a.val);

    return NextResponse.json({
      message: "Report generated",
      data: {
        totalAssets,
        hoursSaved,
        breakdown,
        client: client || "General Client",
        month: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
