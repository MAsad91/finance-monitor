import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ProjectModel from "@/lib/models/project";
import ExpenseModel from "@/lib/models/expense";
import jwt from "jsonwebtoken";

// Exchange rates for currency conversion (same as in project.ts)
const EXCHANGE_RATES_TO_INR: { [key: string]: number } = {
  inr: 1,
  dollars: 0.012,
  dollar: 0.012,
  euro: 0.011,
  pkr: 3.33,
  gbp: 0.0095,
  cad: 0.016,
  aud: 0.018,
};

function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;

  const normalizeCurrency = (curr: string): string => {
    const normalized = curr.toLowerCase();
    if (normalized === "dollars" || normalized === "dollar") return "dollar";
    return normalized;
  };

  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);

  if (from === to) return amount;

  const fromRate = EXCHANGE_RATES_TO_INR[from];
  const toRate = EXCHANGE_RATES_TO_INR[to];

  if (!fromRate || !toRate) {
    console.warn(`Currency conversion rate not found: ${from} or ${to}`);
    return amount;
  }

  const amountInINR = from === "inr" ? amount : amount / fromRate;
  const result = to === "inr" ? amountInINR : amountInINR * toRate;

  return result;
}

// GET - Calculate allocated expenses and disputes for a project
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production"
      ) as { id: string };
      userId = decoded.id;
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await connectToDatabase();
    const project = await ProjectModel.findOne({ _id: id, userId });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get all expenses allocated to this project
    const expenses = await ExpenseModel.find({
      userId,
      projectIds: id,
      status: "Active", // Only count active expenses
    });

    // Convert expenses to project currency and sum
    let totalExpenses = 0;
    for (const expense of expenses) {
      const convertedAmount = convertCurrency(
        expense.amount,
        expense.currency,
        project.priceType
      );
      totalExpenses += convertedAmount;
    }

    return NextResponse.json({
      allocatedExpenses: totalExpenses,
      allocatedDisputes: 0,
      expenses: expenses.map((e) => e.toJSON()),
      disputes: [],
    });
  } catch (error: any) {
    console.error("Error calculating allocations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate allocations" },
      { status: 500 }
    );
  }
}

