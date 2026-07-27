import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AgencyClient from "@/models/AgencyClient";
import { getAuthenticatedAgency } from "@/lib/auth/getAuthenticatedAgency";

export async function GET(request) {
  try {
    const auth = await getAuthenticatedAgency();
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const clientType = searchParams.get("clientType") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    const query = { agencyId: auth.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { businessName: { $regex: search, $options: "i" } },
        { creatorName: { $regex: search, $options: "i" } }
      ];
    }

    if (clientType) query.clientType = clientType;
    
    // Support multiple comma-separated statuses
    if (status) {
      query.status = { $in: status.split(",") };
    }

    await connectDB();
    
    const [clients, total] = await Promise.all([
      AgencyClient.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AgencyClient.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ 
      success: true, 
      message: "Clients fetched successfully",
      data: {
        clients,
        total,
        page,
        totalPages,
        limit
      } 
    }, { status: 200 });
  } catch (error) {
    console.error("Fetch clients error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthenticatedAgency();
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { 
      clientType,
      name, 
      email,
      phone,
      logoUrl,
      company, // legacy fallback
      status,
      notes,
      
      // Creator fields
      creatorName,
      niche,
      platforms,
      contentGoals,
      audienceSize,

      // Business fields
      businessName,
      industry,
      products,
      services,
      website,
      city,
      country,

      // Shared AI fields
      preferredLanguage,
      tone,
      targetAudience,
      brandVoice,
      requiredPhrases,
      bannedWords,
      customRules
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, message: "Client name is required" }, { status: 400 });
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 });
    }

    const type = ["creator", "business"].includes(clientType) ? clientType : "business";

    await connectDB();
    
    const clientData = {
      agencyId: auth.user._id,
      clientType: type,
      name: name.trim(),
      email: email?.trim().toLowerCase() || "",
      phone: phone?.trim() || "",
      logoUrl: logoUrl?.trim() || "",
      company: company?.trim() || "",
      status: ["active", "inactive", "lead", "paused", "archived"].includes(status) ? status : "active",
      notes: notes || "",

      preferredLanguage: preferredLanguage?.trim() || "English",
      tone: tone?.trim() || "Professional",
      targetAudience: targetAudience?.trim() || "General Audience",
      brandVoice: brandVoice?.trim() || "Professional and Authoritative",
      customRules: customRules?.trim() || "",
      requiredPhrases: Array.isArray(requiredPhrases) ? requiredPhrases : [],
      bannedWords: Array.isArray(bannedWords) ? bannedWords : [],
    };

    if (type === "creator") {
      clientData.creatorName = creatorName?.trim() || "";
      clientData.niche = niche?.trim() || "";
      clientData.platforms = Array.isArray(platforms) ? platforms : [];
      clientData.contentGoals = contentGoals?.trim() || "";
      clientData.audienceSize = audienceSize?.trim() || "";
    } else {
      clientData.businessName = businessName?.trim() || "";
      clientData.industry = industry?.trim() || "";
      clientData.products = Array.isArray(products) ? products : [];
      clientData.services = Array.isArray(services) ? services : [];
      clientData.website = website?.trim() || "";
      clientData.city = city?.trim() || "";
      clientData.country = country?.trim() || "";
    }

    const newClient = await AgencyClient.create(clientData);

    return NextResponse.json({ success: true, data: newClient, message: "Client added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Add client error:", error);
    return NextResponse.json({ success: false, message: "Failed to add client" }, { status: 500 });
  }
}
