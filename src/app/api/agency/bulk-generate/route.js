import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import AgencyClient from "@/models/AgencyClient";
import { agencyAccess } from "@/lib/agencyAccess";
import { generateAgencyClientContent } from "@/lib/ai/generateAgencyClientContent";

const CREATOR_TYPES = [
  "hook", "script", "caption", "hashtag", "thumbnail-title",
  "video-description", "creator-caption", "creator-hashtag", "reel-idea", "creator-planner"
];

const BUSINESS_TYPES = [
  "business-post", "business-caption", "business-hashtag",
  "ad-copy", "product-description", "local-seo",
  "review-reply", "whatsapp-reply", "business-planner"
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request) {
  try {
    const auth = await agencyAccess();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { topics, contentType, clientId, platform, language, tone } = body;

    if (!clientId || !contentType || !topics) {
      return NextResponse.json({ error: "clientId, contentType, and topics are required." }, { status: 400 });
    }

    if (!Array.isArray(topics)) {
      return NextResponse.json({ error: "topics must be an array." }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ error: "Invalid client ID format." }, { status: 400 });
    }

    await connectDB();

    const client = await AgencyClient.findOne({ _id: clientId, agencyId: auth.user._id });
    if (!client) {
      return NextResponse.json({ error: "Client not found or unauthorized access." }, { status: 404 });
    }

    // Normalize and limit topics
    const normalizedTopics = topics
      .map(t => typeof t === "string" ? t.trim() : "")
      .filter(t => t.length > 0)
      .map(t => t.length > 200 ? t.substring(0, 200) : t);
      
    const uniqueTopics = [...new Set(normalizedTopics)];
    
    if (uniqueTopics.length === 0) {
      return NextResponse.json({ error: "No valid topics provided." }, { status: 400 });
    }

    if (uniqueTopics.length > 10) {
      return NextResponse.json({ error: "Maximum of 10 topics allowed per request." }, { status: 400 });
    }

    const clientType = client.clientType === "creator" ? "creator" : "business";

    if (clientType === "creator" && !CREATOR_TYPES.includes(contentType)) {
      return NextResponse.json({ error: `Invalid content type for Creator client. Allowed types: ${CREATOR_TYPES.join(", ")}` }, { status: 400 });
    }
    
    if (clientType === "business" && !BUSINESS_TYPES.includes(contentType)) {
      return NextResponse.json({ error: `Invalid content type for Business client. Allowed types: ${BUSINESS_TYPES.join(", ")}` }, { status: 400 });
    }

    const results = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < uniqueTopics.length; i++) {
      const topic = uniqueTopics[i];
      let success = false;
      let errorMsg = null;
      let contentId = null;
      let output = null;

      try {
        const formData = {
          topic,
          platform: platform || "",
          language: language || "",
          tone: tone || "",
          // Map topic to other common fields just in case the AI utility looks for them
          productName: topic, 
          reviewText: topic,
          message: topic
        };

        const idempotencyKey = `bulk-${auth.user._id}-${clientId}-${contentType}-${topic.toLowerCase().replace(/\s+/g, '-')}`;

        const result = await generateAgencyClientContent({
          agencyUser: auth.user,
          client,
          contentType,
          formData,
          idempotencyKey
        });

        if (result.success) {
          success = true;
          successful++;
          contentId = result.data.id;
          output = result.data.output;
        } else {
          throw new Error(result.error || "Generation failed internally.");
        }

      } catch (err) {
        failed++;
        errorMsg = err.message || "Failed to generate content due to an internal error.";
      }

      if (success) {
        results.push({ topic, success: true, contentId, output });
      } else {
        results.push({ topic, success: false, error: errorMsg });
      }
      
      // Delay before next generation to prevent rate limits
      if (i < uniqueTopics.length - 1) {
        await delay(2000); // 2-second safe delay for bulk
      }
    }

    return NextResponse.json({
      success: true,
      total: uniqueTopics.length,
      successful,
      failed,
      results
    }, { status: 201 });

  } catch (error) {
    console.error("Bulk Generate API Error:", error);
    return NextResponse.json({ error: "Failed to process bulk generation request" }, { status: 500 });
  }
}
