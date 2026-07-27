import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";

const checkAgencyAccess = async () => {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user || user.plan !== "agency") {
      return { error: "Unauthorized access. Agency plan required.", status: 403 };
    }
    return { user };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

export async function POST(request) {
  try {
    const auth = await checkAgencyAccess();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { topics, contentType, clientId } = body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: "Please provide an array of topics." }, { status: 400 });
    }

    await connectDB();
    
    // Simulate bulk generation and saving
    const results = [];
    for (const topic of topics) {
      const generatedItem = await SavedContent.create({
        user: auth.user._id,
        ownerType: "business",
        type: contentType || "business-post",
        title: topic,
        content: `[AI Generated content for topic: ${topic} - Client: ${clientId || "General"}] This is a placeholder for bulk generated content.`,
      });
      results.push(generatedItem);
    }

    return NextResponse.json({ 
      message: `Successfully generated ${results.length} items.`,
      data: results 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process bulk generation" }, { status: 500 });
  }
}
