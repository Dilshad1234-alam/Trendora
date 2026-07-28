import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";
import { agencyAccess } from "@/lib/agencyAccess";

export async function GET(request) {
  try {
    const auth = await agencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const query = { agencyId: auth.user._id };

    if (clientId) {
      if (mongoose.Types.ObjectId.isValid(clientId)) {
        query.clientId = clientId;
      } else {
        return NextResponse.json({ error: "Invalid clientId" }, { status: 400 });
      }
    }

    if (type) query.type = type;

    if (status) {
      // Support both pipelineStage and contentStatus interchangeably for backward compatibility
      query.$or = [
        { contentStatus: status },
        { pipelineStage: status }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    await connectDB();
    
    const [savedContent, total] = await Promise.all([
      SavedContent.find(query)
        .populate("clientId", "name clientType logoUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SavedContent.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ 
      success: true, 
      data: savedContent,
      pagination: { total, page, limit, totalPages }
    }, { status: 200 });
  } catch (error) {
    console.error("Fetch agency saved content error:", error);
    return NextResponse.json({ error: "Failed to fetch saved content" }, { status: 500 });
  }
}
