import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ProjectModel from "@/lib/models/project";
import ExpenseModel from "@/lib/models/expense";
import WithdrawalModel from "@/lib/models/withdrawal";
import jwt from "jsonwebtoken";

// Helper function to convert currency to a base currency (INR) for calculations
const convertToINR = (amount: number, currency: string): number => {
  const rates: { [key: string]: number } = {
    inr: 1,
    dollars: 83.33, // 1 USD = 83.33 INR (approximate)
    euro: 90.91, // 1 EUR = 90.91 INR (approximate)
    pkr: 0.30, // 1 PKR = 0.30 INR (approximate)
    gbp: 105.26, // 1 GBP = 105.26 INR (approximate)
    cad: 62.50, // 1 CAD = 62.50 INR (approximate)
    aud: 55.56, // 1 AUD = 55.56 INR (approximate)
  };
  return amount * (rates[currency.toLowerCase()] || 1);
};

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = "inr"): string => {
  const symbols: { [key: string]: string } = {
    inr: "₹",
    dollars: "$",
    euro: "€",
    pkr: "₨",
    gbp: "£",
    cad: "C$",
    aud: "A$",
  };
  const symbol = symbols[currency.toLowerCase()] || "₹";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// GET - Get dashboard statistics
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
      const userId = decoded.id;

      // Get period from query parameter (weekly, monthly, quarterly, annual)
      const { searchParams } = new URL(request.url);
      const period = searchParams.get("period") || "monthly"; // default to monthly

      // Get current date info
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

      // Get all projects for the user
      const projects = await ProjectModel.find({ userId }).lean();
      
      // Get all expenses for the user
      const expenses = await ExpenseModel.find({ userId }).lean();
      
      // Get all withdrawals for the user
      const withdrawals = await WithdrawalModel.find({ userId }).lean();

      // Calculate total revenue (from projects) - using amount after expenses but before charity
      // This allows us to explicitly track and subtract charity separately
      const totalRevenue = projects.reduce((sum, project) => {
        if (project.status === "Completed" || project.status === "Active" || project.status === "in progress") {
          // Use afterExpenses (after platform fees and expenses, but before charity)
          // If afterExpenses is not available, use afterPlatformFee or projectPrice
          const revenueBeforeCharity = project.afterExpenses || project.afterPlatformFee || project.projectPrice || 0;
          return sum + convertToINR(revenueBeforeCharity, project.priceType || "inr");
        }
        return sum;
      }, 0);

      // Calculate total expenses
      const totalExpenses = expenses.reduce((sum, expense) => {
        if (expense.status === "Active" || expense.status === "Completed") {
          // For monthly expenses, calculate based on payment type
          let expenseAmount = convertToINR(expense.amount || 0, expense.currency || "inr");
          
          if (expense.paymentType === "monthly") {
            // For monthly, count as 1 month
            return sum + expenseAmount;
          } else if (expense.paymentType === "yearly") {
            // For yearly, divide by 12
            return sum + (expenseAmount / 12);
          } else if (expense.paymentType === "quarterly") {
            // For quarterly, divide by 3
            return sum + (expenseAmount / 3);
          } else if (expense.paymentType === "bi-annual") {
            // For bi-annual, divide by 6
            return sum + (expenseAmount / 6);
          } else {
            // One-time expense
            return sum + expenseAmount;
          }
        }
        return sum;
      }, 0);

      // Calculate total withdrawals
      const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => {
        if (withdrawal.status === "Completed" || withdrawal.status === "Processing") {
          return sum + convertToINR(withdrawal.amount || 0, withdrawal.currency || "inr");
        }
        return sum;
      }, 0);

      // Calculate total charity from all projects (explicitly track charity deductions)
      const totalCharity = projects.reduce((sum, project) => {
        if (project.status === "Completed" || project.status === "Active" || project.status === "in progress") {
          if (project.includeCharity && project.charityAmount) {
            return sum + convertToINR(project.charityAmount, project.priceType || "inr");
          }
        }
        return sum;
      }, 0);

      // Calculate net profit (Revenue - Expenses - Withdrawals - Charity)
      // Note: totalRevenue uses afterExpenses (before charity) so we can explicitly subtract charity
      // This ensures charity from projects with includeCharity=true is properly deducted
      const netProfit = totalRevenue - totalExpenses - totalWithdrawals - totalCharity;

      // Count active projects
      const activeProjects = projects.filter(
        (p) => p.status === "Active" || p.status === "in progress"
      ).length;

      // Calculate revenue data based on period (weekly, monthly, quarterly, annual)
      let revenueData: number[] = [];
      let expenseData: number[] = [];
      let categories: string[] = [];
      
      if (period === "weekly") {
        // Weekly data for last 12 weeks
        const currentDate = new Date(now);
        currentDate.setHours(23, 59, 59, 999);
        
        for (let i = 11; i >= 0; i--) {
          const weekEnd = new Date(currentDate);
          weekEnd.setDate(weekEnd.getDate() - (i * 7));
          const weekStart = new Date(weekEnd);
          weekStart.setDate(weekStart.getDate() - 6);
          weekStart.setHours(0, 0, 0, 0);
          
          // Format week label (e.g., "W1", "W2", etc.)
          const weekLabel = `W${12 - i}`;
          categories.push(weekLabel);
          
          const weekRevenue = projects
            .filter((p) => {
              const projectDate = new Date(p.projectStartDate);
              return projectDate >= weekStart && projectDate <= weekEnd && 
                     (p.status === "Completed" || p.status === "Active" || p.status === "in progress");
            })
            .reduce((sum, p) => {
              const finalAmount = p.finalAmount || p.afterCharity || p.afterExpenses || p.afterPlatformFee || p.projectPrice || 0;
              return sum + convertToINR(finalAmount, p.priceType || "inr");
            }, 0);
          
          revenueData.push(weekRevenue);
        }
      } else if (period === "monthly") {
        // Monthly data for last 12 months
        categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(currentYear, currentMonth - i, 1);
          const monthEnd = new Date(currentYear, currentMonth - i + 1, 0, 23, 59, 59);
          
          const monthRevenue = projects
            .filter((p) => {
              const projectDate = new Date(p.projectStartDate);
              return projectDate >= monthDate && projectDate <= monthEnd && 
                     (p.status === "Completed" || p.status === "Active" || p.status === "in progress");
            })
            .reduce((sum, p) => {
              const finalAmount = p.finalAmount || p.afterCharity || p.afterExpenses || p.afterPlatformFee || p.projectPrice || 0;
              return sum + convertToINR(finalAmount, p.priceType || "inr");
            }, 0);
          
          revenueData.push(monthRevenue);
        }
      } else if (period === "quarterly") {
        // Quarterly data for last 4 quarters
        categories = ["Q1", "Q2", "Q3", "Q4"];
        for (let i = 3; i >= 0; i--) {
          const quarterStartMonth = currentMonth - (i * 3);
          const quarterYear = currentYear + Math.floor((currentMonth - (i * 3)) / 12);
          const actualQuarterMonth = ((currentMonth - (i * 3)) % 12 + 12) % 12;
          const quarterStart = new Date(quarterYear, actualQuarterMonth, 1);
          const quarterEnd = new Date(quarterYear, actualQuarterMonth + 3, 0, 23, 59, 59);
          
          const quarterRevenue = projects
            .filter((p) => {
              const projectDate = new Date(p.projectStartDate);
              return projectDate >= quarterStart && projectDate <= quarterEnd && 
                     (p.status === "Completed" || p.status === "Active" || p.status === "in progress");
            })
            .reduce((sum, p) => {
              const finalAmount = p.finalAmount || p.afterCharity || p.afterExpenses || p.afterPlatformFee || p.projectPrice || 0;
              return sum + convertToINR(finalAmount, p.priceType || "inr");
            }, 0);
          
          revenueData.push(quarterRevenue);
        }
      } else {
        // Annual data for last 4 years
        categories = [(currentYear - 3).toString(), (currentYear - 2).toString(), (currentYear - 1).toString(), currentYear.toString()];
        for (let i = 3; i >= 0; i--) {
          const year = currentYear - i;
          const yearStart = new Date(year, 0, 1);
          const yearEnd = new Date(year, 11, 31, 23, 59, 59);
          
          const yearRevenue = projects
            .filter((p) => {
              const projectDate = new Date(p.projectStartDate);
              return projectDate >= yearStart && projectDate <= yearEnd && 
                     (p.status === "Completed" || p.status === "Active" || p.status === "in progress");
            })
            .reduce((sum, p) => {
              const finalAmount = p.finalAmount || p.afterCharity || p.afterExpenses || p.afterPlatformFee || p.projectPrice || 0;
              return sum + convertToINR(finalAmount, p.priceType || "inr");
            }, 0);
          
          revenueData.push(yearRevenue);
        }
      }

      // Calculate expenses data based on period
      if (period === "weekly") {
        const currentDate = new Date(now);
        currentDate.setHours(23, 59, 59, 999);
        
        for (let i = 11; i >= 0; i--) {
          const weekEnd = new Date(currentDate);
          weekEnd.setDate(weekEnd.getDate() - (i * 7));
          const weekStart = new Date(weekEnd);
          weekStart.setDate(weekStart.getDate() - 6);
          weekStart.setHours(0, 0, 0, 0);
          
          const weekExpense = expenses
            .filter((e) => {
              const expenseDate = new Date(e.paymentDate);
              return expenseDate >= weekStart && expenseDate <= weekEnd && 
                     (e.status === "Active" || e.status === "Completed");
            })
            .reduce((sum, e) => {
              let expenseAmount = convertToINR(e.amount || 0, e.currency || "inr");
              // For weekly, divide by appropriate factor
              if (e.paymentType === "yearly") expenseAmount = expenseAmount / 52;
              else if (e.paymentType === "quarterly") expenseAmount = expenseAmount / 13;
              else if (e.paymentType === "bi-annual") expenseAmount = expenseAmount / 26;
              else if (e.paymentType === "monthly") expenseAmount = expenseAmount / 4.33; // Approx weeks in month
              // One-time expenses are counted as-is for the week they occur
              return sum + expenseAmount;
            }, 0);
          
          expenseData.push(weekExpense);
        }
      } else if (period === "monthly") {
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(currentYear, currentMonth - i, 1);
          const monthEnd = new Date(currentYear, currentMonth - i + 1, 0, 23, 59, 59);
          
          const monthExpense = expenses
            .filter((e) => {
              const expenseDate = new Date(e.paymentDate);
              return expenseDate >= monthDate && expenseDate <= monthEnd && 
                     (e.status === "Active" || e.status === "Completed");
            })
            .reduce((sum, e) => {
              let expenseAmount = convertToINR(e.amount || 0, e.currency || "inr");
              if (e.paymentType === "yearly") expenseAmount = expenseAmount / 12;
              else if (e.paymentType === "quarterly") expenseAmount = expenseAmount / 3;
              else if (e.paymentType === "bi-annual") expenseAmount = expenseAmount / 6;
              return sum + expenseAmount;
            }, 0);
          
          expenseData.push(monthExpense);
        }
      } else if (period === "quarterly") {
        for (let i = 3; i >= 0; i--) {
          const quarterStartMonth = currentMonth - (i * 3);
          const quarterYear = currentYear + Math.floor((currentMonth - (i * 3)) / 12);
          const actualQuarterMonth = ((currentMonth - (i * 3)) % 12 + 12) % 12;
          const quarterStart = new Date(quarterYear, actualQuarterMonth, 1);
          const quarterEnd = new Date(quarterYear, actualQuarterMonth + 3, 0, 23, 59, 59);
          
          const quarterExpense = expenses
            .filter((e) => {
              const expenseDate = new Date(e.paymentDate);
              return expenseDate >= quarterStart && expenseDate <= quarterEnd && 
                     (e.status === "Active" || e.status === "Completed");
            })
            .reduce((sum, e) => {
              let expenseAmount = convertToINR(e.amount || 0, e.currency || "inr");
              if (e.paymentType === "yearly") expenseAmount = expenseAmount / 4;
              else if (e.paymentType === "quarterly") expenseAmount = expenseAmount;
              else if (e.paymentType === "bi-annual") expenseAmount = expenseAmount / 2;
              else if (e.paymentType === "monthly") expenseAmount = expenseAmount * 3;
              return sum + expenseAmount;
            }, 0);
          
          expenseData.push(quarterExpense);
        }
      } else {
        for (let i = 3; i >= 0; i--) {
          const year = currentYear - i;
          const yearStart = new Date(year, 0, 1);
          const yearEnd = new Date(year, 11, 31, 23, 59, 59);
          
          const yearExpense = expenses
            .filter((e) => {
              const expenseDate = new Date(e.paymentDate);
              return expenseDate >= yearStart && expenseDate <= yearEnd && 
                     (e.status === "Active" || e.status === "Completed");
            })
            .reduce((sum, e) => {
              let expenseAmount = convertToINR(e.amount || 0, e.currency || "inr");
              if (e.paymentType === "yearly") expenseAmount = expenseAmount;
              else if (e.paymentType === "quarterly") expenseAmount = expenseAmount * 4;
              else if (e.paymentType === "bi-annual") expenseAmount = expenseAmount * 2;
              else if (e.paymentType === "monthly") expenseAmount = expenseAmount * 12;
              return sum + expenseAmount;
            }, 0);
          
          expenseData.push(yearExpense);
        }
      }

      // Calculate current month revenue (using afterExpenses - before charity, for consistency with net profit)
      const currentMonthRevenue = projects
        .filter((p) => {
          const projectDate = new Date(p.projectStartDate);
          return projectDate >= startOfMonth && projectDate <= endOfMonth &&
                 (p.status === "Completed" || p.status === "Active" || p.status === "in progress");
        })
        .reduce((sum, p) => {
          // Use afterExpenses (after platform fees and expenses, but before charity)
          const revenueBeforeCharity = p.afterExpenses || p.afterPlatformFee || p.projectPrice || 0;
          return sum + convertToINR(revenueBeforeCharity, p.priceType || "inr");
        }, 0);

      // Calculate current month expenses
      const currentMonthExpenses = expenses
        .filter((e) => {
          const expenseDate = new Date(e.paymentDate);
          return expenseDate >= startOfMonth && expenseDate <= endOfMonth &&
                 (e.status === "Active" || e.status === "Completed");
        })
        .reduce((sum, e) => {
          let expenseAmount = convertToINR(e.amount || 0, e.currency || "inr");
          if (e.paymentType === "yearly") expenseAmount = expenseAmount / 12;
          else if (e.paymentType === "quarterly") expenseAmount = expenseAmount / 3;
          else if (e.paymentType === "bi-annual") expenseAmount = expenseAmount / 6;
          return sum + expenseAmount;
        }, 0);

      // Calculate previous month revenue for comparison (using afterExpenses - before charity)
      const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
      const prevMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
      const prevMonthRevenue = projects
        .filter((p) => {
          const projectDate = new Date(p.projectStartDate);
          return projectDate >= prevMonthStart && projectDate <= prevMonthEnd &&
                 (p.status === "Completed" || p.status === "Active" || p.status === "in progress");
        })
        .reduce((sum, p) => {
          // Use afterExpenses (after platform fees and expenses, but before charity)
          const revenueBeforeCharity = p.afterExpenses || p.afterPlatformFee || p.projectPrice || 0;
          return sum + convertToINR(revenueBeforeCharity, p.priceType || "inr");
        }, 0);

      // Calculate revenue growth percentage (current month vs previous month)
      let revenueGrowth = 0;
      if (prevMonthRevenue > 0) {
        revenueGrowth = ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
      } else if (prevMonthRevenue === 0 && currentMonthRevenue > 0) {
        // If previous month was 0 and current month has revenue, show 100% growth
        revenueGrowth = 100;
      } else {
        // Both are 0, no growth
        revenueGrowth = 0;
      }

      // Calculate previous month expenses for comparison
      const prevMonthExpenses = expenses
        .filter((e) => {
          const expenseDate = new Date(e.paymentDate);
          return expenseDate >= prevMonthStart && expenseDate <= prevMonthEnd &&
                 (e.status === "Active" || e.status === "Completed");
        })
        .reduce((sum, e) => {
          let expenseAmount = convertToINR(e.amount || 0, e.currency || "inr");
          if (e.paymentType === "yearly") expenseAmount = expenseAmount / 12;
          else if (e.paymentType === "quarterly") expenseAmount = expenseAmount / 3;
          else if (e.paymentType === "bi-annual") expenseAmount = expenseAmount / 6;
          return sum + expenseAmount;
        }, 0);

      // Calculate expense growth percentage (current month vs previous month)
      // Note: For expenses, negative growth (decrease) is good, positive growth (increase) is bad
      let expenseGrowth = 0;
      if (prevMonthExpenses > 0) {
        expenseGrowth = ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100;
      } else if (prevMonthExpenses === 0 && currentMonthExpenses > 0) {
        // If previous month was 0 and current month has expenses, show 100% growth
        expenseGrowth = 100;
      } else {
        // Both are 0, no growth
        expenseGrowth = 0;
      }

      // Calculate previous month net profit for comparison
      const prevMonthNetProfit = prevMonthRevenue - prevMonthExpenses;
      const currentMonthNetProfit = currentMonthRevenue - currentMonthExpenses;

      // Calculate net profit growth percentage (current month vs previous month)
      let netProfitGrowth = 0;
      const difference = currentMonthNetProfit - prevMonthNetProfit;
      
      if (prevMonthNetProfit > 0) {
        // Previous month was positive profit
        netProfitGrowth = (difference / prevMonthNetProfit) * 100;
      } else if (prevMonthNetProfit < 0) {
        // Previous month was negative (loss)
        // Use absolute value for percentage calculation
        netProfitGrowth = (difference / Math.abs(prevMonthNetProfit)) * 100;
      } else {
        // Previous month was 0
        if (currentMonthNetProfit > 0) {
          netProfitGrowth = 100; // From 0 to positive
        } else if (currentMonthNetProfit < 0) {
          netProfitGrowth = -100; // From 0 to negative
        } else {
          netProfitGrowth = 0; // Both are 0
        }
      }

      // Get expense categories breakdown
      const categoryBreakdown: { [key: string]: number } = {};
      expenses.forEach((expense) => {
        if (expense.status === "Active" || expense.status === "Completed") {
          const category = expense.category || "Other";
          const amount = convertToINR(expense.amount || 0, expense.currency || "inr");
          if (!categoryBreakdown[category]) {
            categoryBreakdown[category] = 0;
          }
          categoryBreakdown[category] += amount;
        }
      });

      // Get recent projects (last 5, sorted by creation date)
      const recentProjects = projects
        .sort((a, b) => new Date(b.createdAt || b.projectStartDate).getTime() - new Date(a.createdAt || a.projectStartDate).getTime())
        .slice(0, 5)
        .map((p) => ({
          id: p._id?.toString() || "",
          name: p.projectTitle,
          amount: p.finalAmount || p.afterCharity || p.afterExpenses || p.afterPlatformFee || p.projectPrice || 0,
          currency: p.priceType || "inr",
          status: p.status,
          date: p.projectStartDate,
          platform: p.platformName,
        }));

      // Calculate monthly budget progress (assuming a target based on average)
      const monthlyBudgetTarget = totalRevenue > 0 ? totalRevenue / 12 : 100000; // Default 100k if no revenue
      const budgetProgress = monthlyBudgetTarget > 0 
        ? (currentMonthRevenue / monthlyBudgetTarget) * 100 
        : 0;

      return NextResponse.json({
        metrics: {
          totalRevenue: {
            value: totalRevenue,
            formatted: formatCurrency(totalRevenue, "inr"),
            growth: revenueGrowth,
          },
          totalExpenses: {
            value: totalExpenses,
            formatted: formatCurrency(totalExpenses, "inr"),
            growth: expenseGrowth,
          },
          netProfit: {
            value: netProfit,
            formatted: formatCurrency(netProfit, "inr"),
            growth: netProfitGrowth,
          },
          activeProjects: {
            value: activeProjects,
          },
        },
        monthlyRevenue: revenueData,
        monthlyExpenses: expenseData,
        period,
        categories,
        currentMonth: {
          revenue: currentMonthRevenue,
          expenses: currentMonthExpenses,
          budgetTarget: monthlyBudgetTarget,
          budgetProgress: Math.min(budgetProgress, 100),
        },
        categoryBreakdown,
        recentProjects,
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("DASHBOARD_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while fetching dashboard data" },
      { status: 500 }
    );
  }
}

