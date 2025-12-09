"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, DollarLineIcon, AlertIcon, ShootingStarIcon, TaskIcon } from "@/icons";
import { DashboardData } from "@/lib/api/dashboard";
import { useCurrency } from "@/context/CurrencyContext";

interface FinanceMetricsProps {
  dashboardData: DashboardData;
}

export const FinanceMetrics = ({ dashboardData }: FinanceMetricsProps) => {
  const { formatCurrency } = useCurrency();
  const metrics = dashboardData.metrics;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Total Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
          <DollarLineIcon className="text-green-600 size-6 dark:text-green-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Revenue
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatCurrency(metrics.totalRevenue.value, "inr")}
            </h4>
          </div>
          <Badge color={(metrics.totalRevenue.growth ?? 0) >= 0 ? "success" : "error"}>
            {(metrics.totalRevenue.growth ?? 0) >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon className="text-error-500" />}
            {(metrics.totalRevenue.growth ?? 0) >= 0 ? "+" : ""}{((metrics.totalRevenue.growth ?? 0)).toFixed(2)}%
          </Badge>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-900/20">
          <AlertIcon className="text-red-600 size-6 dark:text-red-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Expenses
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatCurrency(metrics.totalExpenses.value, "inr")}
            </h4>
          </div>
          <Badge color={(metrics.totalExpenses.growth ?? 0) <= 0 ? "success" : "error"}>
            {(metrics.totalExpenses.growth ?? 0) <= 0 ? <ArrowDownIcon className="text-success-500" /> : <ArrowUpIcon />}
            {(metrics.totalExpenses.growth ?? 0) >= 0 ? "+" : ""}{((metrics.totalExpenses.growth ?? 0)).toFixed(2)}%
          </Badge>
        </div>
      </div>

      {/* Net Profit */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
          <ShootingStarIcon className="text-blue-600 size-6 dark:text-blue-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Net Profit
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatCurrency(metrics.netProfit.value, "inr")}
            </h4>
          </div>
          <Badge color={(metrics.netProfit.growth ?? 0) >= 0 ? "success" : "error"}>
            {(metrics.netProfit.growth ?? 0) >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon className="text-error-500" />}
            {(metrics.netProfit.growth ?? 0) >= 0 ? "+" : ""}{((metrics.netProfit.growth ?? 0)).toFixed(2)}%
          </Badge>
        </div>
      </div>

      {/* Active Projects */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/20">
          <TaskIcon className="text-purple-600 size-6 dark:text-purple-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Active Projects
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.activeProjects.value}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

