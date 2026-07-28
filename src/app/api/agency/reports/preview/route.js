import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";
import AgencyClient from "@/models/AgencyClient";
import { agencyAccess } from "@/lib/agencyAccess";
import { checkAgencyPermission } from "@/lib/auth/checkAgencyPermission";

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

export async function GET(request) {
  try {
    await connectDB();
    const auth = await agencyAccess();
    
    const perm = await checkAgencyPermission(auth);
    if (!perm.success) {
      return NextResponse.json({ error: perm.message }, { status: perm.status });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ error: "A valid client ID is required." }, { status: 400 });
    }

    const client = await AgencyClient.findOne({ _id: clientId, agencyId: auth.user._id });
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const query = { agencyId: auth.user._id, clientId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const contentList = await SavedContent.find(query).populate("assignedTo", "memberName").lean();

    // Calculate Analytics
    let totalTimeSavedMinutes = 0;
    const contentByType = {};
    const contentByStatus = {
      "draft": 0,
      "internal-review": 0,
      "client-review": 0,
      "approved": 0,
      "rejected": 0,
      "scheduled": 0,
      "published": 0
    };
    
    // Using simple format YYYY-MM-DD
    const activityByDate = {};
    const teamContribution = {};
    const creatorVsBusiness = { creator: 0, business: 0 };

    contentList.forEach(item => {
      // Time Saved
      const timeSaved = AI_TIME_SAVED_MAP[item.type] || 15; // default 15m if unknown
      totalTimeSavedMinutes += timeSaved;

      // By Type
      const typeStr = item.type.replace("-", " ");
      contentByType[typeStr] = (contentByType[typeStr] || 0) + 1;

      // By Status
      const status = item.contentStatus || "draft";
      contentByStatus[status] = (contentByStatus[status] || 0) + 1;

      // By Date
      const dateKey = new Date(item.createdAt).toISOString().split("T")[0];
      activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;

      // Team Contribution
      if (item.assignedTo) {
        const member = item.assignedTo.memberName;
        teamContribution[member] = (teamContribution[member] || 0) + 1;
      } else {
        teamContribution["Unassigned"] = (teamContribution["Unassigned"] || 0) + 1;
      }

      // Creator vs Business
      const cType = item.clientType || client.clientType || "business";
      creatorVsBusiness[cType] = (creatorVsBusiness[cType] || 0) + 1;
    });

    // Formatting outputs for UI
    const breakdown = Object.entries(contentByType).map(([name, val]) => ({ name, val })).sort((a, b) => b.val - a.val);

    const hoursSaved = (totalTimeSavedMinutes / 60).toFixed(1);

    return NextResponse.json({ 
      success: true, 
      data: {
        client: client.name || client.businessName || client.creatorName,
        clientType: client.clientType,
        totalAssets: contentList.length,
        hoursSaved: parseFloat(hoursSaved),
        breakdown,
        contentByStatus,
        activityByDate,
        teamContribution,
        creatorVsBusiness
      } 
    }, { status: 200 });

  } catch (error) {
    console.error("GET Reports Preview error:", error);
    return NextResponse.json({ error: "Failed to generate report preview." }, { status: 500 });
  }
}
