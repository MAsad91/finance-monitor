import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import WithdrawalModel from "@/lib/models/withdrawal";
import jwt from "jsonwebtoken";

// GET - Get all withdrawals for the authenticated user
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
      ) as { id: string };

      await connectToDatabase();

      const withdrawals = await WithdrawalModel.find({ userId: decoded.id }).sort({
        createdAt: -1,
      });

      return NextResponse.json({ withdrawals });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("GET_WITHDRAWALS_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while fetching withdrawals" },
      { status: 500 }
    );
  }
}

// POST - Create a new withdrawal
export async function POST(request: NextRequest) {
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
      ) as { id: string };

      const body = await request.json();

      await connectToDatabase();

      const withdrawal = new WithdrawalModel({
        ...body,
        userId: decoded.id,
        projectIds: body.projectIds || [],
      });

      await withdrawal.save();

      return NextResponse.json(
        { withdrawal, message: "Withdrawal created successfully" },
        { status: 201 }
      );
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("CREATE_WITHDRAWAL_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while creating withdrawal" },
      { status: 500 }
    );
  }
}

