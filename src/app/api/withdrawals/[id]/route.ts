import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import WithdrawalModel from "@/lib/models/withdrawal";
import jwt from "jsonwebtoken";

// GET - Get a single withdrawal by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

      const withdrawal = await WithdrawalModel.findOne({
        _id: id,
        userId: decoded.id,
      });

      if (!withdrawal) {
        return NextResponse.json(
          { error: "Withdrawal not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ withdrawal });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("GET_WITHDRAWAL_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while fetching withdrawal" },
      { status: 500 }
    );
  }
}

// PUT - Update a withdrawal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

      const withdrawal = await WithdrawalModel.findOneAndUpdate(
        { _id: id, userId: decoded.id },
        { ...body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!withdrawal) {
        return NextResponse.json(
          { error: "Withdrawal not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        withdrawal,
        message: "Withdrawal updated successfully",
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("UPDATE_WITHDRAWAL_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while updating withdrawal" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a withdrawal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

      const withdrawal = await WithdrawalModel.findOneAndDelete({
        _id: id,
        userId: decoded.id,
      });

      if (!withdrawal) {
        return NextResponse.json(
          { error: "Withdrawal not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Withdrawal deleted successfully",
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("DELETE_WITHDRAWAL_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while deleting withdrawal" },
      { status: 500 }
    );
  }
}

