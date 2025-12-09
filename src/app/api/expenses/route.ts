import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ExpenseModel from "@/lib/models/expense";
import { recalculateProjectAmounts } from "@/lib/utils/projectCalculations";
import jwt from "jsonwebtoken";

// GET - Get all expenses for the authenticated user
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

      const expenses = await ExpenseModel.find({ userId: decoded.id }).sort({
        createdAt: -1,
      });

      return NextResponse.json({ expenses });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("GET_EXPENSES_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while fetching expenses" },
      { status: 500 }
    );
  }
}

// POST - Create a new expense
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

      const projectIds: string[] = Array.isArray(body.projectIds) ? body.projectIds : [];
      
      console.log(`[CREATE EXPENSE] Creating expense:`, {
        name: body.name,
        amount: body.amount,
        currency: body.currency,
        status: body.status,
        projectIds: projectIds,
        projectIdsCount: projectIds.length,
      });

      const expense = new ExpenseModel({
        ...body,
        projectIds,
        userId: decoded.id,
      });

      await expense.save();
      
      console.log(`[CREATE EXPENSE] Expense saved:`, {
        id: expense._id,
        name: expense.name,
        projectIds: expense.projectIds,
        status: expense.status,
      });

      if (projectIds.length > 0) {
        await Promise.all(
          projectIds.map((projectId) => recalculateProjectAmounts(projectId))
        );
      }

      return NextResponse.json(
        { expense, message: "Expense created successfully" },
        { status: 201 }
      );
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("CREATE_EXPENSE_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while creating expense" },
      { status: 500 }
    );
  }
}

