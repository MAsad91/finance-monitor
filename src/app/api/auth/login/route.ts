import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/lib/models/user";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
    } catch (dbError: any) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed. Please check your environment variables." },
        { status: 500 }
      );
    }
    
    const user = await UserModel.findOne({ email: parsed.data.email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Convert to plain object to ensure all fields are accessible
    const userObj = user.toObject ? user.toObject() : user;

    // Debug: Log what we got from the database
    console.log("User from DB:", {
      email: userObj.email,
      hasPasswordHash: !!userObj.passwordHash,
      passwordHashLength: userObj.passwordHash?.length,
      allKeys: Object.keys(userObj),
    });

    if (!userObj.passwordHash) {
      console.error("User found but passwordHash is missing:", userObj.email);
      console.error("Available fields:", Object.keys(userObj));
      return NextResponse.json(
        { error: "Account error. Please contact support." },
        { status: 500 }
      );
    }

    const valid = await bcrypt.compare(parsed.data.password, userObj.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Ensure user has all required fields
    const userId = userObj.id || userObj._id?.toString() || "";

    // Create JWT token - expires in 3 days (72 hours)
    const token = jwt.sign(
      {
        id: userId,
        email: userObj.email,
        name: userObj.name,
        modules: userObj.modules || { freelance: false, household: false },
      },
      process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production",
      { expiresIn: "3d" }
    );

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: userObj.email,
        name: userObj.name,
        modules: userObj.modules || { freelance: false, household: false },
      },
    });

    // Set HTTP-only cookie with token
    // Important: Don't set domain in development to allow localhost
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 3, // 3 days (72 hours)
      path: "/",
    };
    
    // Only set domain in production
    if (process.env.NODE_ENV === "production" && process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }
    
    response.cookies.set("auth-token", token, cookieOptions);

    console.log("Login successful - cookie set for user:", userId);
    console.log("Cookie settings:", cookieOptions);

    return response;
  } catch (error: any) {
    console.error("LOGIN_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}

