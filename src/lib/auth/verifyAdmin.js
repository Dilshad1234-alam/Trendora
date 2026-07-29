import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const verifyAdmin = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fallback: if role isn't in token or to be completely secure, fetch from DB
    await connectDB();
    const user = await User.findById(decoded.userId).lean();
    
    if (!user || user.role !== "admin") {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
};
