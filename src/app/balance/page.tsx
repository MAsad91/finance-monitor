"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { projectsApi } from "@/lib/api/projects";
import { withdrawalsApi } from "@/lib/api/withdrawals";
import { expensesApi, Expense } from "@/lib/api/expenses";
import { Project } from "@/app/projects/types";
import { Withdrawal } from "@/lib/api/withdrawals";
import WithdrawalsSection from "./components/WithdrawalsSection";

const CURRENCY_SYMBOLS: { [key: string]: string } = {
  inr: "₹",
  dollars: "$",
  euro: "€",
  pkr: "₨",
  gbp: "£",
  cad: "C$",
  aud: "A$",
};

const CURRENCY_NAMES: { [key: string]: string } = {
  inr: "INR",
  dollars: "USD",
  euro: "EUR",
  pkr: "PKR",
  gbp: "GBP",
  cad: "CAD",
  aud: "AUD",
};

// Approximate exchange rates (for display purposes only)
const EXCHANGE_RATES: { [key: string]: number } = {
  inr: 1,
  dollars: 0.012,
  euro: 0.011,
  pkr: 3.33,
  gbp: 0.0095,
  cad: 0.016,
  aud: 0.018,
};

const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  let amountInINR: number;
  if (fromCurrency === "inr") {
    amountInINR = amount;
  } else {
    const rateToINR = 1 / EXCHANGE_RATES[fromCurrency];
    amountInINR = amount * rateToINR;
  }
  
  if (toCurrency === "inr") {
    return amountInINR;
  } else {
    return amountInINR * EXCHANGE_RATES[toCurrency];
  }
};

const formatPrice = (price: number, type: string) => {
  const symbol = CURRENCY_SYMBOLS[type.toLowerCase()] || "$";
  return `${symbol}${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function BalancePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState<string>("pkr");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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
        const fetchedExpenses = expensesResult.data || [];
        console.log(`[Balance Page] Fetched ${fetchedExpenses.length} expenses from API`);
        fetchedExpenses.forEach((exp: Expense, index: number) => {
          console.log(`[Balance Page] Expense ${index + 1}: "${exp.name}" - Status: ${exp.status}, Amount: ${exp.amount} ${exp.currency}`);
        });
        setExpenses(fetchedExpenses);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals by currency
  const calculations = useMemo(() => {
    const totalsByCurrency: { [key: string]: { projects: number; withdrawals: number; expenses: number; charity: number } } = {};

    // Calculate total from projects and charity
    projects.forEach((project) => {
      const currency = project.priceType;
      if (!totalsByCurrency[currency]) {
        totalsByCurrency[currency] = { projects: 0, withdrawals: 0, expenses: 0, charity: 0 };
      }
      totalsByCurrency[currency].projects += project.finalAmount || project.projectPrice;
      // Add charity amount if charity is enabled
      if (project.includeCharity && project.charityAmount) {
        totalsByCurrency[currency].charity += project.charityAmount;
      }
    });

    // Calculate total withdrawals (including withdrawal fees)
    withdrawals.forEach((withdrawal) => {
      const currency = withdrawal.currency;
      if (!totalsByCurrency[currency]) {
        totalsByCurrency[currency] = { projects: 0, withdrawals: 0, expenses: 0, charity: 0 };
      }
      // Add withdrawal amount
      totalsByCurrency[currency].withdrawals += withdrawal.amount;
      // Add withdrawal fee if it exists (convert to withdrawal currency if needed)
      if (withdrawal.withdrawalFee && withdrawal.withdrawalFeeType) {
        const feeInWithdrawalCurrency = convertCurrency(
          withdrawal.withdrawalFee,
          withdrawal.withdrawalFeeType,
          currency
        );
        totalsByCurrency[currency].withdrawals += feeInWithdrawalCurrency;
      }
    });

    // Calculate total expenses (only count Active expenses)
    console.log(`[Balance Calculation] Total expenses fetched: ${expenses.length}`);
    let activeExpenseCount = 0;
    expenses.forEach((expense) => {
      console.log(`[Balance Calculation] Expense: "${expense.name}" - Status: ${expense.status}, Amount: ${expense.amount} ${expense.currency}`);
      if (expense.status === "Active") {
        activeExpenseCount++;
        const currency = expense.currency;
        if (!totalsByCurrency[currency]) {
          totalsByCurrency[currency] = { projects: 0, withdrawals: 0, expenses: 0, charity: 0 };
        }
        totalsByCurrency[currency].expenses += expense.amount;
        console.log(`[Balance Calculation] Added expense "${expense.name}": ${expense.amount} ${currency}`);
      } else {
        console.log(`[Balance Calculation] Skipped expense "${expense.name}" - Status is "${expense.status}", not "Active"`);
      }
    });
    console.log(`[Balance Calculation] Active expenses counted: ${activeExpenseCount}`);

    // Convert all to display currency and sum
    let totalProjects = 0;
    let totalWithdrawals = 0;
    let totalExpenses = 0;
    let totalCharity = 0;

    Object.entries(totalsByCurrency).forEach(([currency, amounts]) => {
      totalProjects += convertCurrency(amounts.projects, currency, displayCurrency);
      totalWithdrawals += convertCurrency(amounts.withdrawals, currency, displayCurrency);
      totalExpenses += convertCurrency(amounts.expenses, currency, displayCurrency);
      totalCharity += convertCurrency(amounts.charity || 0, currency, displayCurrency);
    });

    const remainingBalance = totalProjects - totalWithdrawals - totalExpenses - totalCharity;

    return {
      totalsByCurrency,
      totalProjects,
      totalWithdrawals,
      totalExpenses,
      totalCharity,
      remainingBalance,
    };
  }, [projects, withdrawals, expenses, displayCurrency]);

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

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Balance" />
        <div className="mt-6 flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading balance...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Balance" />

      <div className="mt-6 space-y-6">
        {/* Currency Selector */}
        <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Display Currency
            </h3>
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              {Object.entries(CURRENCY_NAMES).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Balance Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Total from Projects */}
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total from Projects
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
                {formatPrice(calculations.totalProjects, displayCurrency)}
              </p>
            </div>
          </div>

          {/* Total Withdrawals */}
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Withdrawals
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                -{formatPrice(calculations.totalWithdrawals, displayCurrency)}
              </p>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Expenses
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                -{formatPrice(calculations.totalExpenses, displayCurrency)}
              </p>
            </div>
          </div>

          {/* Total Charity */}
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Charity
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                -{formatPrice(calculations.totalCharity, displayCurrency)}
              </p>
            </div>
          </div>

          {/* Remaining Balance */}
          <div className="rounded-2xl border-2 border-brand-500 bg-brand-50 px-6 py-6 dark:border-brand-400 dark:bg-brand-900/20">
            <div className="mb-2">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
                Remaining Balance
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                {formatPrice(calculations.remainingBalance, displayCurrency)}
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown by Currency */}
        <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Breakdown by Currency
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(calculations.totalsByCurrency).map(([currency, amounts]) => {
              const convertedProjects = convertCurrency(amounts.projects, currency, displayCurrency);
              const convertedWithdrawals = convertCurrency(amounts.withdrawals, currency, displayCurrency);
              const convertedExpenses = convertCurrency(amounts.expenses, currency, displayCurrency);
              const convertedCharity = convertCurrency(amounts.charity || 0, currency, displayCurrency);
              const convertedRemaining = convertedProjects - convertedWithdrawals - convertedExpenses - convertedCharity;

              return (
                <div
                  key={currency}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {CURRENCY_NAMES[currency] || currency.toUpperCase()}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Projects:</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {formatPrice(convertedProjects, displayCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Withdrawals:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        -{formatPrice(convertedWithdrawals, displayCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Expenses:</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        -{formatPrice(convertedExpenses, displayCurrency)}
                      </span>
                    </div>
                    {convertedCharity > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Charity:</span>
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          -{formatPrice(convertedCharity, displayCurrency)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Remaining:
                        </span>
                        <span className="font-bold text-brand-600 dark:text-brand-400">
                          {formatPrice(convertedRemaining, displayCurrency)}
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
          formatPrice={formatPrice}
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

