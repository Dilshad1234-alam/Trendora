import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";
import AgencyClient from "@/models/AgencyClient";
import AgencyTeam from "@/models/AgencyTeam";
import AgencyTask from "@/models/AgencyTask";
import AgencyActivity from "@/models/AgencyActivity";
import AgencyUsage from "@/models/AgencyUsage";
import { agencyAccess } from "@/lib/agencyAccess";
import mongoose from "mongoose";

const AI_TIME_SAVED_MAP = {
  "hook": 10,
  "caption": 10,
  "creator-caption": 10,
  "business-caption": 10,
  "hashtag": 10,
  "creator-hashtag": 10,
  "business-hashtag": 10,
  "business-post": 20,
  "post": 20,
  "creator-post": 20,
  "script": 60,
  "ad-copy": 30,
  "product-description": 25,
  "local-seo": 45,
  "review-reply": 5,
  "whatsapp-reply": 5,
};

export async function GET(req) {
  try {
    const auth = await agencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });

    await connectDB();
    const agencyId = auth.user._id;

    // Dates for filtering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    fourWeeksAgo.setHours(0, 0, 0, 0);

    // Run aggregations and counts in parallel
    const [
      clientCounts,
      teamCounts,
      taskStats,
      recentActivity,
      contentStats,
      contentGenerations,
      industryData
    ] = await Promise.all([
      // 1. Client Stats
      AgencyClient.aggregate([
        { $match: { agencyId: new mongoose.Types.ObjectId(agencyId) } },
        { 
          $group: { 
            _id: null,
            active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
            paused: { $sum: { $cond: [{ $eq: ["$status", "paused"] }, 1, 0] } },
            archived: { $sum: { $cond: [{ $eq: ["$status", "archived"] }, 1, 0] } },
            creator: { $sum: { $cond: [{ $eq: ["$clientType", "creator"] }, 1, 0] } },
            business: { $sum: { $cond: [{ $eq: ["$clientType", "business"] }, 1, 0] } },
          }
        }
      ]),
      // 2. Team Stats
      AgencyTeam.aggregate([
        { $match: { agencyId: new mongoose.Types.ObjectId(agencyId) } },
        {
          $group: {
            _id: null,
            active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
            invited: { $sum: { $cond: [{ $eq: ["$status", "invited"] }, 1, 0] } },
          }
        }
      ]),
      // 3. Task Stats
      AgencyTask.aggregate([
        { $match: { agencyId: new mongoose.Types.ObjectId(agencyId) } },
        {
          $group: {
            _id: null,
            dueToday: { $sum: { $cond: [{ $and: [{ $ne: ["$status", "completed"] }, { $gte: ["$dueDate", todayStart] }, { $lte: ["$dueDate", todayEnd] }] }, 1, 0] } },
            overdue: { $sum: { $cond: [{ $and: [{ $ne: ["$status", "completed"] }, { $lt: ["$dueDate", todayStart] }] }, 1, 0] } },
            completedThisWeek: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "completed"] }, { $gte: ["$completedAt", startOfWeek] }] }, 1, 0] } },
          }
        }
      ]),
      // 4. Recent Activity (Agency Activity Logs)
      AgencyActivity.find({ agencyId }).sort({ createdAt: -1 }).limit(6).lean(),
      
      // 5. General Content Stats
      SavedContent.find({ agencyId }).lean(),

      // 6. Content generation trend by week (last 4 weeks)
      SavedContent.aggregate([
        { $match: { agencyId: new mongoose.Types.ObjectId(agencyId), createdAt: { $gte: fourWeeksAgo } } },
        {
          $group: {
            _id: { $week: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 7. Client Industry Distribution
      AgencyClient.aggregate([
        { $match: { agencyId: new mongoose.Types.ObjectId(agencyId) } },
        {
          $group: {
            _id: { $cond: [{ $ifNull: ["$industry", false] }, "$industry", "$niche"] },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Parse Content Stats
    let totalGeneratedContent = 0;
    let aiGenerationsThisMonth = 0;
    let draftContent = 0;
    let pendingApprovals = 0;
    let approvedThisMonth = 0;
    let scheduledContent = 0;
    let publishedThisMonth = 0;
    let totalTimeSavedMinutes = 0;

    const contentByType = {};

    contentStats.forEach(item => {
      totalGeneratedContent++;
      
      const timeSaved = AI_TIME_SAVED_MAP[item.type] || 15;
      totalTimeSavedMinutes += timeSaved;

      const typeStr = item.type.replace("-", " ");
      contentByType[typeStr] = (contentByType[typeStr] || 0) + 1;

      const created = new Date(item.createdAt);
      if (created >= startOfMonth) aiGenerationsThisMonth++;

      const status = item.contentStatus || "draft";
      if (status === "draft") draftContent++;
      if (status === "internal-review" || status === "client-review") pendingApprovals++;
      if (status === "scheduled") scheduledContent++;
      
      if (status === "approved" && new Date(item.approvedAt || item.updatedAt) >= startOfMonth) approvedThisMonth++;
      if (status === "published" && new Date(item.publishedAt || item.updatedAt) >= startOfMonth) publishedThisMonth++;
    });

    const hoursSaved = (totalTimeSavedMinutes / 60).toFixed(1);

    // Format Generation Data
    const generationTrendByWeek = contentGenerations.map((g, i) => ({
      name: `Week ${i + 1}`,
      generated: g.count
    }));

    // If empty generation data, populate with zeroes
    if (generationTrendByWeek.length === 0) {
      for(let i=1; i<=4; i++) {
        generationTrendByWeek.push({ name: `Week ${i}`, generated: 0 });
      }
    }

    // Format Pie Data
    const clientIndustryDistribution = industryData
      .filter(i => i._id)
      .map(i => ({
        name: i._id,
        value: i.count
      }));

    if (clientIndustryDistribution.length === 0) {
      clientIndustryDistribution.push({ name: "No Clients", value: 1 });
    }

    // Role check for premium usage stats (auth.user is owner, auth.teamMember has role)
    const role = auth.teamMember ? auth.teamMember.role : "owner";
    let aiUsageStats = null;
    
    if (role === "owner" || role === "admin") {
      const usage = await AgencyUsage.findOne({ agencyId, monthKey: startOfMonth.toISOString().substring(0, 7) }).lean();
      if (usage) {
        aiUsageStats = {
          generations: usage.generations,
          successfulGenerations: usage.successfulGenerations,
          failedGenerations: usage.failedGenerations,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens
        };
      } else {
        aiUsageStats = { generations: 0, successfulGenerations: 0, failedGenerations: 0, inputTokens: 0, outputTokens: 0 };
      }
    }

    return NextResponse.json({
      message: "Agency Dashboard Data",
      data: {
        user: {
          name: auth.user.name || auth.user.fullname,
          email: auth.user.email,
          plan: auth.user.plan,
          role
        },
        aiUsageStats,
        stats: {
          activeClients: clientCounts[0]?.active || 0,
          pausedClients: clientCounts[0]?.paused || 0,
          archivedClients: clientCounts[0]?.archived || 0,
          creatorClients: clientCounts[0]?.creator || 0,
          businessClients: clientCounts[0]?.business || 0,
          
          activeTeamMembers: teamCounts[0]?.active || 0,
          invitedTeamMembers: teamCounts[0]?.invited || 0,
          
          tasksDueToday: taskStats[0]?.dueToday || 0,
          overdueTasks: taskStats[0]?.overdue || 0,
          tasksCompletedThisWeek: taskStats[0]?.completedThisWeek || 0,
          
          totalGeneratedContent,
          aiGenerationsThisMonth,
          draftContent,
          pendingApprovals,
          approvedThisMonth,
          scheduledContent,
          publishedThisMonth,
          
          estimatedAiHoursSaved: parseFloat(hoursSaved),
        },
        generationTrendByWeek,
        clientIndustryDistribution,
        contentByType,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Agency Dashboard API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
