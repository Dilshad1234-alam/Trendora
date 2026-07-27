import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import connectDB from "@/lib/db";

export const checkAgencyAccess = async () => {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) {
    return { error: "Unauthorized. Please login first.", status: 401 };
  }
  
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return { error: "User not found.", status: 404 };
    }
    
    if (user.plan !== "agency" && user.role !== "admin") {
      return { error: "Unauthorized access. Agency subscription required.", status: 403 };
    }
    
    return { user };
  } catch (error) {
    return { error: "Invalid or expired token.", status: 401 };
  }
};
