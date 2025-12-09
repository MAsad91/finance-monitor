"use client";
import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { dashboardApi } from "@/lib/api/dashboard";
import { useCurrency } from "@/context/CurrencyContext";
import CircularLoader from "@/components/ui/loader/CircularLoader";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type Period = "weekly" | "monthly" | "quarterly" | "annual";

export default function FinanceStatisticsChart() {
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [expenseData, setExpenseData] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [period, setPeriod] = useState<Period>("monthly");
  const [loading, setLoading] = useState(true);
  const { currency, convertCurrency, getCurrencySymbol } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await dashboardApi.getDashboardData(period);
      if (result.data) {
        // Convert data from INR to selected currency
        const convertedRevenue = result.data.monthlyRevenue.map(amount => 
          convertCurrency(amount, "inr", currency)
        );
        const convertedExpenses = result.data.monthlyExpenses.map(amount => 
          convertCurrency(amount, "inr", currency)
        );
        setRevenueData(convertedRevenue);
        setExpenseData(convertedExpenses);
        setCategories(result.data.categories || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [period, currency, convertCurrency]);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#10B981", "#EF4444"], // Green for Revenue, Red for Expenses
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        format: "dd MMM yyyy",
      },
      y: {
        formatter: (val: number) => {
          const symbol = getCurrencySymbol(currency);
          return `${symbol}${val.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        },
      },
    },
    xaxis: {
      type: "category",
      categories: categories.length > 0 ? categories : (period === "weekly"
        ? Array.from({ length: 12 }, (_, i) => `W${12 - i}`)
        : period === "monthly" 
        ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        : period === "quarterly"
        ? ["Q1", "Q2", "Q3", "Q4"]
        : ["2021", "2022", "2023", "2024"]),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (val: number) => {
          const symbol = getCurrencySymbol(currency);
          return `${symbol}${val.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Revenue",
      data: revenueData.length > 0 ? revenueData : Array(categories.length || (period === "weekly" ? 12 : period === "monthly" ? 12 : period === "quarterly" ? 4 : 4)).fill(0),
    },
    {
      name: "Expenses",
      data: expenseData.length > 0 ? expenseData : Array(categories.length || (period === "weekly" ? 12 : period === "monthly" ? 12 : period === "quarterly" ? 4 : 4)).fill(0),
    },
  ];

  const getPeriodLabel = () => {
    switch (period) {
      case "weekly":
        return "Revenue vs Expenses over the last 12 weeks";
      case "monthly":
        return "Revenue vs Expenses over the last 12 months";
      case "quarterly":
        return "Revenue vs Expenses over the last 4 quarters";
      case "annual":
        return "Revenue vs Expenses over the last 4 years";
      default:
        return "Revenue vs Expenses";
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-center py-12">
          <CircularLoader text="Loading statistics..." />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Finance Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {getPeriodLabel()}
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
            <button
              onClick={() => setPeriod("weekly")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === "weekly"
                  ? "bg-brand-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === "monthly"
                  ? "bg-brand-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod("quarterly")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === "quarterly"
                  ? "bg-brand-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setPeriod("annual")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === "annual"
                  ? "bg-brand-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Annual
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}
