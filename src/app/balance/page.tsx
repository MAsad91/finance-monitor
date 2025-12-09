"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { projectsApi } from "@/lib/api/projects";
import { withdrawalsApi } from "@/lib/api/withdrawals";
import { expensesApi, Expense } from "@/lib/api/expenses";
import { Project } from "@/app/projects/types";
import { Withdrawal } from "@/lib/api/withdrawals";
import WithdrawalsSection from "./components/WithdrawalsSection";
import { useCurrency } from "@/context/CurrencyContext";
import { DollarLineIcon, AlertIcon, ShootingStarIcon, TaskIcon, BoxIcon } from "@/icons";
import { dashboardApi } from "@/lib/api/dashboard";
import CircularLoader from "@/components/ui/loader/CircularLoader";

export default function BalancePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardMetrics, setDashboardMetrics] = useState<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalCharity: number;
    totalWithdrawals: number;
  } | null>(null);
  const { currency, setCurrency, convertCurrency, formatCurrency, CURRENCY_NAMES } = useCurrency();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard metrics FIRST (already calculated correctly)
      const dashboardResult = await dashboardApi.getDashboardData();
      
      if (!dashboardResult.data) {
        console.error("Error fetching dashboard data:", dashboardResult.error);
        alert("Failed to load dashboard data. Please try again.");
        setLoading(false);
        return;
      }

      const metrics = dashboardResult.data.metrics;
      setDashboardMetrics({
        totalRevenue: metrics.totalRevenue.value, // Already in INR
        totalExpenses: metrics.totalExpenses.value, // Already in INR
        netProfit: metrics.netProfit.value, // Already in INR
        totalCharity: 0, // Will calculate from projects
        totalWithdrawals: 0, // Will calculate from withdrawals
      });
      
      // Fetch raw data for breakdown by currency
      const [projectsResult, withdrawalsResult, expensesResult] = await Promise.all([
        projectsApi.getAll(),
        withdrawalsApi.getAll(),
        expensesApi.getAll(),
      ]);

      if (projectsResult.error) {
        console.error("Error fetching projects:", projectsResult.error);
      } else {
        setProjects(projectsResult.data || []);
      }

      if (withdrawalsResult.error) {
        console.error("Error fetching withdrawals:", withdrawalsResult.error);
      } else {
        setWithdrawals(withdrawalsResult.data || []);
      }

      if (expensesResult.error) {
        console.error("Error fetching expenses:", expensesResult.error);
      } else {
        setExpenses(expensesResult.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert to INR (matching dashboard API logic exactly)
  const convertToINR = (amount: number, currency: string): number => {
    const rates: { [key: string]: number } = {
      inr: 1,
      dollars: 83.33, // 1 USD = 83.33 INR
      euro: 90.91, // 1 EUR = 90.91 INR
      pkr: 0.30, // 1 PKR = 0.30 INR
      gbp: 105.26, // 1 GBP = 105.26 INR
      cad: 62.50, // 1 CAD = 62.50 INR
      aud: 55.56, // 1 AUD = 55.56 INR
    };
    return amount * (rates[currency.toLowerCase()] || 1);
  };

  // Calculate totals using dashboard API values and calculate charity/withdrawals
  const calculations = useMemo(() => {
    if (!dashboardMetrics) {
      return {
        totalsByCurrency: {},
        totalProjects: 0,
        totalWithdrawals: 0,
        totalExpenses: 0,
        totalCharity: 0,
        remainingBalance: 0,
      };
    }

    // Calculate total withdrawals in INR (matching dashboard API)
    let totalWithdrawalsINR = 0;
    withdrawals.forEach((withdrawal) => {
      if (withdrawal.status === "Completed" || withdrawal.status === "Processing") {
        totalWithdrawalsINR += convertToINR(withdrawal.amount || 0, withdrawal.currency || "inr");
      }
    });

    // Calculate total charity in INR (matching dashboard API)
    let totalCharityINR = 0;
    projects.forEach((project) => {
      if (project.status === "Completed" || project.status === "Active" || project.status === "in progress") {
        if (project.includeCharity && project.charityAmount) {
          totalCharityINR += convertToINR(project.charityAmount, project.priceType || "inr");
        }
      }
    });

    // Convert from INR to display currency
    const totalProjects = convertCurrency(dashboardMetrics.totalRevenue, "inr", currency);
    const totalWithdrawals = convertCurrency(totalWithdrawalsINR, "inr", currency);
    const totalExpenses = convertCurrency(dashboardMetrics.totalExpenses, "inr", currency);
    const totalCharity = convertCurrency(totalCharityINR, "inr", currency);

    // Calculate remaining balance (using dashboard netProfit + withdrawals + charity)
    // Net profit = Revenue - Expenses - Withdrawals - Charity
    // So: Remaining = Revenue - Expenses - Withdrawals - Charity = NetProfit
    const remainingBalance = convertCurrency(dashboardMetrics.netProfit, "inr", currency);

    // Track totals by original currency for breakdown display
    const totalsByCurrency: { [key: string]: { projects: number; withdrawals: number; expenses: number; charity: number } } = {};

    // Calculate breakdown by currency
    projects.forEach((project) => {
      if (project.status === "Completed" || project.status === "Active" || project.status === "in progress") {
        const projectCurrency = project.priceType || "inr";
        if (!totalsByCurrency[projectCurrency]) {
          totalsByCurrency[projectCurrency] = { projects: 0, withdrawals: 0, expenses: 0, charity: 0 };
        }
        const revenueBeforeCharity = project.afterExpenses || project.afterPlatformFee || project.projectPrice || 0;
        totalsByCurrency[projectCurrency].projects += revenueBeforeCharity;
        if (project.includeCharity && project.charityAmount) {
          totalsByCurrency[projectCurrency].charity += project.charityAmount;
        }
      }
    });

    withdrawals.forEach((withdrawal) => {
      if (withdrawal.status === "Completed" || withdrawal.status === "Processing") {
        const withdrawalCurrency = withdrawal.currency || "inr";
        if (!totalsByCurrency[withdrawalCurrency]) {
          totalsByCurrency[withdrawalCurrency] = { projects: 0, withdrawals: 0, expenses: 0, charity: 0 };
        }
        totalsByCurrency[withdrawalCurrency].withdrawals += withdrawal.amount || 0;
      }
    });

    expenses.forEach((expense) => {
      if (expense.status === "Active" || expense.status === "Completed") {
        const expenseCurrency = expense.currency || "inr";
        if (!totalsByCurrency[expenseCurrency]) {
          totalsByCurrency[expenseCurrency] = { projects: 0, withdrawals: 0, expenses: 0, charity: 0 };
        }
        let expenseAmount = expense.amount || 0;
        const paymentType = expense.paymentType || "one-time";
        if (paymentType === "yearly") {
          expenseAmount = expenseAmount / 12;
        } else if (paymentType === "quarterly") {
          expenseAmount = expenseAmount / 3;
        } else if (paymentType === "bi-annual") {
          expenseAmount = expenseAmount / 6;
        }
        totalsByCurrency[expenseCurrency].expenses += expenseAmount;
      }
    });

    return {
      totalsByCurrency,
      totalProjects,
      totalWithdrawals,
      totalExpenses,
      totalCharity,
      remainingBalance,
    };
  }, [dashboardMetrics, projects, withdrawals, expenses, currency, convertCurrency]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Pending":
        return "warning";
      case "Processing":
        return "info";
      case "Failed":
        return "error";
      default:
        return "primary";
    }
  };

  if (loading || !dashboardMetrics) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Balance" />
        <div className="mt-6 flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <CircularLoader text="Loading balance..." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Balance" />

      {/* Currency Selector at top right */}
      <div className="mt-6 mb-6 flex justify-end">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-white/[0.03]">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Currency:
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            {Object.entries(CURRENCY_NAMES).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {/* Balance Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-5">
          {/* Total from Projects */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
              <DollarLineIcon className="text-green-600 size-6 dark:text-green-400" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total from Projects
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatCurrency(calculations.totalProjects)}
              </h4>
            </div>
          </div>

          {/* Total Withdrawals */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-900/20">
              <AlertIcon className="text-red-600 size-6 dark:text-red-400" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Withdrawals
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatCurrency(calculations.totalWithdrawals)}
              </h4>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-900/20">
              <TaskIcon className="text-orange-600 size-6 dark:text-orange-400" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Expenses
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatCurrency(calculations.totalExpenses)}
              </h4>
            </div>
          </div>

          {/* Total Charity */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/20">
              <BoxIcon className="text-purple-600 size-6 dark:text-purple-400" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Charity
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatCurrency(calculations.totalCharity)}
              </h4>
            </div>
          </div>

          {/* Remaining Balance */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
              <ShootingStarIcon className="text-blue-600 size-6 dark:text-blue-400" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Remaining Balance
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatCurrency(calculations.remainingBalance)}
              </h4>
            </div>
          </div>
        </div>

        {/* Breakdown by Currency */}
        <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Breakdown by Currency
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(calculations.totalsByCurrency).map(([currencyKey, amounts]) => {
              // Convert each amount from its original currency to INR, then to display currency
              const projectsInINR = convertToINR(amounts.projects, currencyKey);
              const withdrawalsInINR = convertToINR(amounts.withdrawals, currencyKey);
              const expensesInINR = convertToINR(amounts.expenses, currencyKey);
              const charityInINR = convertToINR(amounts.charity || 0, currencyKey);
              
              const convertedProjects = convertCurrency(projectsInINR, "inr", currency);
              const convertedWithdrawals = convertCurrency(withdrawalsInINR, "inr", currency);
              const convertedExpenses = convertCurrency(expensesInINR, "inr", currency);
              const convertedCharity = convertCurrency(charityInINR, "inr", currency);
              const convertedRemaining = convertedProjects - convertedWithdrawals - convertedExpenses - convertedCharity;

              return (
                <div
                  key={currencyKey}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {CURRENCY_NAMES[currencyKey] || currencyKey.toUpperCase()}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Projects:</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {formatCurrency(convertedProjects)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Withdrawals:</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {formatCurrency(convertedWithdrawals)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Expenses:</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {formatCurrency(convertedExpenses)}
                      </span>
                    </div>
                    {convertedCharity > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Charity:</span>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {formatCurrency(convertedCharity)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Remaining:
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white/90">
                          {formatCurrency(convertedRemaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Withdrawals Management Section */}
        <WithdrawalsSection
          withdrawals={withdrawals}
          projects={projects}
          onRefresh={fetchData}
          formatPrice={(price: number, type: string) => formatCurrency(price, type)}
          getStatusColor={(status) => {
            switch (status) {
              case "Completed":
                return "success";
              case "Pending":
                return "warning";
              case "Processing":
                return "info";
              case "Failed":
                return "error";
              default:
                return "primary";
            }
          }}
        />

        {/* Note */}
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Balance is calculated as (Total from Projects) - (Total Withdrawals) - (Total Expenses) - (Total Charity). 
            Only Active expenses are included in the calculation. Charity amounts are included only for projects with charity enabled. 
            Currency conversion uses approximate exchange rates for display purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}

