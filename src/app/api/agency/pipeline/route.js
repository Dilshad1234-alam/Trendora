import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";
import AgencyClient from "@/models/AgencyClient";
import User from "@/models/User";
import { agencyAccess } from "@/lib/agencyAccess";

export async function GET(request) {
  try {
    const auth = await agencyAccess();
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const clientType = searchParams.get("clientType");
    const contentType = searchParams.get("contentType");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");

    const query = {
      agencyId: auth.user._id,
      // Ensure we only fetch items that have an agency workflow attached
      clientId: { $ne: null } 
    };

    if (clientId) {
      if (mongoose.Types.ObjectId.isValid(clientId)) {
        query.clientId = clientId;
      }
    }

    if (clientType) {
      query.clientType = clientType;
    }

    if (contentType) {
      query.type = contentType;
    }
    
    if (assignedTo) {
      if (mongoose.Types.ObjectId.isValid(assignedTo)) {
        query.assignedTo = assignedTo;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    await connectDB();

    const items = await SavedContent.find(query)
      .populate({
        path: "clientId",
        select: "name businessName creatorName clientType",
        model: AgencyClient
      })
      .sort({ updatedAt: -1 })
      .lean();

    // Map the new contentStatus enums
    const pipelineStages = [
      "draft", 
      "internal-review", 
      "client-review", 
      "approved", 
      "rejected", 
      "scheduled", 
      "published"
    ];

    const stages = {};
    pipelineStages.forEach(stage => {
      stages[stage] = [];
    });

    items.forEach(item => {
      const status = item.contentStatus || "draft";
      
      let clientName = "Unknown Client";
      if (item.clientId) {
        clientName = item.clientId.name || item.clientId.businessName || item.clientId.creatorName || "Unknown Client";
      }

      const formattedItem = {
        id: item._id.toString(),
        title: item.title || "Untitled Content",
        type: item.type,
        content: item.content,
        clientName,
        clientType: item.clientType || (item.clientId?.clientType) || "business",
        clientId: item.clientId?._id?.toString() || null,
        assignedTo: item.assignedTo?.toString() || null,
        status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };

      if (stages[status]) {
        stages[status].push(formattedItem);
      } else {
        // Fallback for legacy pipelineStage if contentStatus is somewhat invalid
        stages["draft"].push(formattedItem);
      }
    });

    const pipelineData = [
      {
        id: "draft",
        title: "Drafts",
        color: "bg-zinc-100 text-zinc-700 border-zinc-200",
        items: stages["draft"]
      },
      {
        id: "internal-review",
        title: "Internal Review",
        color: "bg-amber-100 text-amber-700 border-amber-200",
        items: stages["internal-review"]
      },
      {
        id: "client-review",
        title: "Client Review",
        color: "bg-orange-100 text-orange-700 border-orange-200",
        items: stages["client-review"]
      },
      {
        id: "approved",
        title: "Approved",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        items: stages["approved"]
      },
      {
        id: "rejected",
        title: "Rejected",
        color: "bg-red-100 text-red-700 border-red-200",
        items: stages["rejected"]
      },
      {
        id: "scheduled",
        title: "Scheduled",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        items: stages["scheduled"]
      },
      {
        id: "published",
        title: "Published",
        color: "bg-violet-100 text-violet-700 border-violet-200",
        items: stages["published"]
      }
    ];

    return NextResponse.json({ success: true, data: pipelineData }, { status: 200 });

  } catch (error) {
    console.error("Agency Pipeline API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
