import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ExpenseModel from "@/lib/models/expense";
import { recalculateProjectAmounts } from "@/lib/utils/projectCalculations";
import jwt from "jsonwebtoken";

// GET - Get a single expense by ID
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

      const expense = await ExpenseModel.findOne({
        _id: id,
        userId: decoded.id,
      });

      if (!expense) {
        return NextResponse.json(
          { error: "Expense not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ expense });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("GET_EXPENSE_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while fetching expense" },
      { status: 500 }
    );
  }
}

// PUT - Update an expense
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

      const expense = await ExpenseModel.findOne({ _id: id, userId: decoded.id });

      if (!expense) {
        return NextResponse.json(
          { error: "Expense not found" },
          { status: 404 }
        );
      }

      const previousProjectIds = Array.isArray(expense.projectIds) ? expense.projectIds : [];
      
      console.log(`[UPDATE EXPENSE] Updating expense "${expense.name}":`, {
        id,
        previousProjectIds,
        newProjectIds: body.projectIds,
        status: body.status || expense.status,
      });

      const updatePayload = { ...body };
      if (body.projectIds !== undefined) {
        updatePayload.projectIds = Array.isArray(body.projectIds) ? body.projectIds : [];
      }

      Object.assign(expense, updatePayload);
      expense.updatedAt = new Date().toISOString();

      await expense.save();

      const updatedProjectIds = Array.isArray(expense.projectIds) ? expense.projectIds : [];
      const affectedProjects = Array.from(new Set([...previousProjectIds, ...updatedProjectIds]));
      
      console.log(`[UPDATE EXPENSE] Expense updated:`, {
        id: expense._id,
        name: expense.name,
        updatedProjectIds,
        affectedProjects,
        status: expense.status,
      });

      if (affectedProjects.length > 0) {
        await Promise.all(affectedProjects.map((projectId) => recalculateProjectAmounts(projectId)));
      }

      return NextResponse.json({
        expense,
        message: "Expense updated successfully",
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("UPDATE_EXPENSE_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while updating expense" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an expense
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

      const expense = await ExpenseModel.findOneAndDelete({
        _id: id,
        userId: decoded.id,
      });

      if (!expense) {
        return NextResponse.json(
          { error: "Expense not found" },
          { status: 404 }
        );
      }

      const projectIds: string[] = Array.isArray(expense.projectIds) ? expense.projectIds : [];
      if (projectIds.length > 0) {
        await Promise.all(projectIds.map((projectId) => recalculateProjectAmounts(projectId)));
      }

      return NextResponse.json({
        message: "Expense deleted successfully",
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("DELETE_EXPENSE_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while deleting expense" },
      { status: 500 }
    );
  }
}

