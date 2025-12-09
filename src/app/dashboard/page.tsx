"use client";

import { FinanceMetrics } from "@/components/ecommerce/FinanceMetrics";
import React, { useState, useEffect } from "react";
import MonthlyBudget from "@/components/ecommerce/MonthlyBudget";
import MonthlyRevenueChart from "@/components/ecommerce/MonthlyRevenueChart";
import FinanceStatisticsChart from "@/components/ecommerce/FinanceStatisticsChart";
import RecentProjects from "@/components/ecommerce/RecentProjects";
import ExpenseCategoriesCard from "@/components/ecommerce/ExpenseCategoriesCard";
import { useCurrency } from "@/context/CurrencyContext";
import { dashboardApi, DashboardData } from "@/lib/api/dashboard";
import CircularLoader from "@/components/ui/loader/CircularLoader";

export default function DashboardPage() {
  const { currency, setCurrency, CURRENCY_NAMES, convertCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [statisticsPeriod, setStatisticsPeriod] = useState<"weekly" | "monthly" | "quarterly" | "annual">("monthly");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await dashboardApi.getDashboardData(statisticsPeriod);
      if (result.data) {
        setDashboardData(result.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [statisticsPeriod]);

  // Refetch when currency changes (but don't show loader for currency changes)
  useEffect(() => {
    if (dashboardData) {
      // Data is already loaded, just update currency conversion in components
      // Components will handle currency conversion themselves
    }
  }, [currency]);

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <CircularLoader text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div>
      {/* Currency Selector at top right */}
      <div className="mb-6 flex justify-end">
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

      <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <FinanceMetrics dashboardData={dashboardData} />

        <MonthlyRevenueChart dashboardData={dashboardData} />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyBudget dashboardData={dashboardData} />
      </div>

      <div className="col-span-12">
        <FinanceStatisticsChart 
          dashboardData={dashboardData} 
          period={statisticsPeriod}
          onPeriodChange={setStatisticsPeriod}
        />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <ExpenseCategoriesCard dashboardData={dashboardData} />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentProjects dashboardData={dashboardData} />
      </div>
      </div>
    </div>
  );
}

