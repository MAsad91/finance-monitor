import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/lib/models/user";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  modules: z.object({
    freelance: z.boolean(),
    household: z.boolean(),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const errorMessage =
        Object.values(errors)
          .flat()
          .join(", ") || "Invalid form data";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Validate at least one module is selected
    if (!parsed.data.modules.freelance && !parsed.data.modules.household) {
      return NextResponse.json(
        { error: "Please select at least one module to manage" },
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
    
    const existing = await UserModel.findOne({ email: parsed.data.email });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const newUser = await UserModel.create({
      ...parsed.data,
      passwordHash,
    });

    console.log("User created successfully:", newUser.email);

    return NextResponse.json(
      { success: true, message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("REGISTER_ERROR", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          error.message || "Unable to register user. Please try again later.",
      },
      { status: 500 }
    );
  }
}

