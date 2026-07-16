import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import GeneratedContent from "@/models/GeneratedContent";
import SavedContent from "@/models/SavedContent";

const allowedTypes = [
  // Creator
  "hook",
  "script",
  "caption",
  "hashtag",
  "thumbnail-title",
  "video-description",
  "content-rewriter",
  "viral-idea",
  "cta",
  "weekly-plan",

  // Business
  "business-post",
  "business-caption",
  "business-hashtag",
  "business-thumbnail-title",
  "business-video-description",
  "ad-copy",
  "product-description",
  "local-seo",
  "review-reply",
  "whatsapp-reply",
];

export async function POST(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    let decoded;

    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token.",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    if (!["creator", "business"].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid account role.",
        },
        { status: 403 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please send valid JSON data.",
        },
        { status: 400 }
      );
    }

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : "";

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    const generatedContentId =
      body.generatedContentId ||
      body.generatedContent ||
      null;

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required.",
        },
        { status: 400 }
      );
    }

    if (!type || !allowedTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid content type: ${type || "missing"}.`,
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          message: "Content is required.",
        },
        { status: 400 }
      );
    }

    // GeneratedContent optional hai.
    let generatedContent = null;

    if (
      generatedContentId &&
      mongoose.Types.ObjectId.isValid(
        String(generatedContentId)
      )
    ) {
      const generatedRecord =
        await GeneratedContent.findOne({
          _id: generatedContentId,
          user: user._id,
        }).select("_id");

      if (generatedRecord) {
        generatedContent = generatedRecord._id;
      }
    }

    const duplicateQuery = {
      user: user._id,
      ownerType: user.role,
      type,
      content,
    };

    if (generatedContent) {
      duplicateQuery.generatedContent =
        generatedContent;
    }

    const alreadySaved =
      await SavedContent.findOne(duplicateQuery);

    if (alreadySaved) {
      return NextResponse.json(
        {
          success: true,
          message: "Content is already saved.",
          data: {
            id: alreadySaved._id.toString(),
            title: alreadySaved.title,
            type: alreadySaved.type,
            content: alreadySaved.content,
            ownerType: alreadySaved.ownerType,
            generatedContent:
              alreadySaved.generatedContent?.toString() ||
              null,
            createdAt: alreadySaved.createdAt,
          },
        },
        { status: 200 }
      );
    }

    const savedContent =
      await SavedContent.create({
        user: user._id,
        ownerType: user.role,
        generatedContent,
        title,
        type,
        content,
      });

    return NextResponse.json(
      {
        success: true,
        message: "Content saved successfully.",
        data: {
          id: savedContent._id.toString(),
          title: savedContent.title,
          type: savedContent.type,
          content: savedContent.content,
          ownerType: savedContent.ownerType,
          generatedContent:
            savedContent.generatedContent?.toString() ||
            null,
          createdAt: savedContent.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save content API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save content.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    let decoded;

    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token.",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") || "all";
    const search = searchParams.get("search")?.trim() || "";

    const query = {
      user: user._id,
      ownerType: user.role,
    };

    if (type !== "all") {
      query.type = type;
    }

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          content: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const savedContents = await SavedContent.find(query)
      .sort({
        createdAt: -1,
      })
      .lean();

    const formattedContents = savedContents.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      type: item.type,
      content: item.content,
      ownerType: item.ownerType,
      generatedContent:
        item.generatedContent?.toString() || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Saved content fetched successfully.",
        data: formattedContents,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get saved content API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch saved content.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}