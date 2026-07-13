import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

import User from "@/models/User";
import SavedContent from "@/models/SavedContent";
import GeneratedContent from "@/models/GeneratedContent";

const allowedTypes = [
  "hook",
  "script",
  "caption",
  "hashtag",
  "local-seo",
  "review-reply",
  "weekly-plan",
];

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      error: "Unauthorized. Please login first.",
      status: 401,
    };
  }

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch {
    return {
      error: "Invalid or expired token.",
      status: 401,
    };
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    return {
      error: "User not found.",
      status: 404,
    };
  }

  return { user };
}

/*
  POST /api/saved
  Generated content ko save karega
*/
export async function POST(request) {
  try {
    await connectDB();

    const auth = await getAuthenticatedUser();

    if (auth.error) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error,
        },
        { status: auth.status }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please send saved content details in JSON format.",
        },
        { status: 400 }
      );
    }

    const title = body.title?.trim();
    const type = body.type?.trim().toLowerCase();
    const content = body.content?.trim();
    const generatedContentId = body.generatedContentId?.trim() || null;

    if (!title || !type || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, type and content are required.",
        },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid content type.",
        },
        { status: 400 }
      );
    }

    let generatedContent = null;

    if (generatedContentId) {
      generatedContent = await GeneratedContent.findOne({
        _id: generatedContentId,
        user: auth.user._id,
      });

      if (!generatedContent) {
        return NextResponse.json(
          {
            success: false,
            message: "Generated content not found.",
          },
          { status: 404 }
        );
      }
    }

    const alreadySavedQuery = generatedContent
      ? {
          user: auth.user._id,
          generatedContent: generatedContent._id,
        }
      : {
          user: auth.user._id,
          type,
          content,
        };

    const alreadySaved = await SavedContent.findOne(alreadySavedQuery);

    if (alreadySaved) {
      return NextResponse.json(
        {
          success: false,
          message: "This content is already saved.",
        },
        { status: 409 }
      );
    }

    const savedContent = await SavedContent.create({
      user: auth.user._id,
      generatedContent: generatedContent?._id || null,
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
          generatedContentId:
            savedContent.generatedContent?.toString() || null,
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

/*
  GET /api/saved
  Logged-in user ka saved content return karega
*/
export async function GET(request) {
  try {
    await connectDB();

    const auth = await getAuthenticatedUser();

    if (auth.error) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error,
        },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type")?.trim().toLowerCase();
    const search = searchParams.get("search")?.trim();

    const query = {
      user: auth.user._id,
    };

    if (type && type !== "all") {
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
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: savedContents.length,
        data: savedContents.map((item) => ({
          id: item._id.toString(),
          title: item.title,
          type: item.type,
          content: item.content,
          generatedContentId:
            item.generatedContent?.toString() || null,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get saved contents API error:", error);

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