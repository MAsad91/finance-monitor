"use client";
import { useState } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { DashboardData } from "@/lib/api/dashboard";
import { useCurrency } from "@/context/CurrencyContext";

interface ExpenseCategoriesCardProps {
  dashboardData: DashboardData;
}

export default function ExpenseCategoriesCard({ dashboardData }: ExpenseCategoriesCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { formatCurrency, convertCurrency } = useCurrency();
  const categoryBreakdown = dashboardData.categoryBreakdown;

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }


  // Calculate total for percentage calculation
  const total = Object.values(categoryBreakdown).reduce((sum, amount) => sum + amount, 0);

  // Sort categories by amount (descending) and take top 5
  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Expense Categories
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Breakdown by category
          </p>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="space-y-5 mt-6">
        {topCategories.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No expense categories found
          </p>
        ) : (
          topCategories.map(([category, amount]) => {
            const percentage = total > 0 ? (amount / total) * 100 : 0;
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/20">
                    <span className="text-brand-600 dark:text-brand-400 font-semibold text-sm">
                      {category.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                      {category}
                    </p>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {formatCurrency(convertCurrency(amount, "inr"), "inr")}
                    </span>
                  </div>
                </div>

                <div className="flex w-full max-w-[140px] items-center gap-3">
                  <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                    <div
                      className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {percentage.toFixed(0)}%
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

