import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/lib/models/user";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production"
      ) as {
        id: string;
        email: string;
        name: string;
        modules: { freelance: boolean; household: boolean };
      };

      try {
        await connectToDatabase();
      } catch (dbError: any) {
        console.error("Database connection error:", dbError);
        return NextResponse.json(
          { error: "Database connection failed. Please check your environment variables." },
          { status: 500 }
        );
      }
      
      // Use findById with proper error handling
      let user;
      try {
        user = await UserModel.findById(decoded.id);
      } catch (findError: any) {
        // If findById fails, try finding by email as fallback
        user = await UserModel.findOne({ email: decoded.email });
      }

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const userId = user.id || user._id?.toString() || "";
      return NextResponse.json({
        user: {
          id: userId,
          email: user.email,
          name: user.name,
          modules: user.modules || { freelance: false, household: false },
        },
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("SESSION_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

