"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";
import Label from "@/components/form/Label";
import { Expense } from "../types";
import { Project } from "@/app/projects/types";

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  projects: Project[];
}

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

const formatPrice = (price: number, type: string) => {
  const symbol = CURRENCY_SYMBOLS[type.toLowerCase()] || "$";
  return `${symbol}${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "success";
    case "Cancelled":
      return "warning";
    case "Completed":
      return "info";
    default:
      return "primary";
  }
};

export default function ExpenseDetailModal({
  isOpen,
  onClose,
  expense,
  projects,
}: ExpenseDetailModalProps) {
  const [displayCurrency, setDisplayCurrency] = useState<string>("pkr");

  const convertedAmount = useMemo(() => {
    if (!expense) return 0;
    return convertCurrency(expense.amount, expense.currency, displayCurrency);
  }, [expense, displayCurrency]);

  const linkedProjects = useMemo(() => {
    if (!expense || !expense.projectIds || expense.projectIds.length === 0) return [];
    const map = new Map(projects.map((project) => [project.id, project.projectTitle]));
    return expense.projectIds.map((id) => ({
      id,
      name: map.get(id) || id,
    }));
  }, [expense, projects]);

  if (!expense) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] p-5 lg:p-10 mt-20"
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
            Expense Details
          </h4>
          <div className="flex items-center gap-3">
            <Label className="text-sm">Display Currency:</Label>
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
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
          {/* Expense Name and Status */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {expense.name}
            </h3>
            <Badge size="sm" color={getStatusColor(expense.status)}>
              {expense.status}
            </Badge>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h5 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Financial Information
              </h5>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Amount</Label>
                  <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {formatPrice(convertedAmount, displayCurrency)}
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({formatPrice(expense.amount, expense.currency)} original)
                    </span>
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Payment Type</Label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {expense.paymentType.charAt(0).toUpperCase() + expense.paymentType.slice(1)}
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Category</Label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {expense.category}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Information */}
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h5 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Date Information
              </h5>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {expense.startDate}
                  </p>
                </div>

                {expense.endDate && (
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                      {expense.endDate}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Payment Date</Label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {expense.paymentDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {expense.notes && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h5 className="mb-2 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Notes
              </h5>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {expense.notes}
              </p>
            </div>
          )}

          {/* Linked Projects */}
          {linkedProjects.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h5 className="mb-2 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Linked Projects
              </h5>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                {linkedProjects.map((project) => (
                  <li key={project.id}>
                    {project.name}
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({project.id})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Note about exchange rates */}
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Currency conversion is for display purposes only and uses approximate exchange rates.
            </p>
          </div>
        </div>

        <div className="mt-6 flex w-full items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

