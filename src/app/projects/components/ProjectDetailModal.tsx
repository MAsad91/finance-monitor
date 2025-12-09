"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";
import Label from "@/components/form/Label";
import { Project } from "../types";

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

// Approximate exchange rates (for display purposes only)
const EXCHANGE_RATES: { [key: string]: number } = {
  inr: 1, // Base currency
  dollars: 0.012, // 1 INR = 0.012 USD
  euro: 0.011, // 1 INR = 0.011 EUR
  pkr: 3.33, // 1 INR = 3.33 PKR
  gbp: 0.0095, // 1 INR = 0.0095 GBP
  cad: 0.016, // 1 INR = 0.016 CAD
  aud: 0.018, // 1 INR = 0.018 AUD
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
  
  // Convert to INR first (base currency)
  let amountInINR: number;
  if (fromCurrency === "inr") {
    amountInINR = amount;
  } else {
    // Convert from source currency to INR
    const rateToINR = 1 / EXCHANGE_RATES[fromCurrency];
    amountInINR = amount * rateToINR;
  }
  
  // Convert from INR to target currency
  if (toCurrency === "inr") {
    return amountInINR;
  } else {
    return amountInINR * EXCHANGE_RATES[toCurrency];
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "success";
    case "in progress":
      return "info";
    case "Active":
      return "success";
    case "Inactive":
      return "warning";
    default:
      return "primary";
  }
};

export default function ProjectDetailModal({
  isOpen,
  onClose,
  project,
}: ProjectDetailModalProps) {
  const [displayCurrency, setDisplayCurrency] = useState<string>("pkr");

  const convertedAmounts = useMemo(() => {
    if (!project) return null;

    const originalCurrency = project.priceType;
    
    return {
      projectPrice: convertCurrency(project.projectPrice, originalCurrency, displayCurrency),
      platformFeeAmount: project.platformFeeAmount
        ? convertCurrency(project.platformFeeAmount, originalCurrency, displayCurrency)
        : 0,
      totalAmount: project.totalAmount
        ? convertCurrency(project.totalAmount, originalCurrency, displayCurrency)
        : project.projectPrice,
      afterPlatformFee: project.afterPlatformFee
        ? convertCurrency(project.afterPlatformFee, originalCurrency, displayCurrency)
        : project.projectPrice,
      withdrawalFees: project.allocatedExpenses
        ? convertCurrency(project.allocatedExpenses, originalCurrency, displayCurrency)
        : 0,
      afterWithdrawalFees: project.afterExpenses
        ? convertCurrency(project.afterExpenses, originalCurrency, displayCurrency)
        : project.afterPlatformFee || project.projectPrice,
      finalAmountAfterExpenses: project.afterExpenses
        ? convertCurrency(project.afterExpenses, originalCurrency, displayCurrency)
        : project.afterPlatformFee || project.projectPrice,
      charityAmount: project.charityAmount
        ? convertCurrency(project.charityAmount, originalCurrency, displayCurrency)
        : 0,
      afterCharity: project.afterCharity
        ? convertCurrency(project.afterCharity, originalCurrency, displayCurrency)
        : project.afterExpenses || project.afterPlatformFee || project.projectPrice,
      finalAmount: project.finalAmount
        ? convertCurrency(project.finalAmount, originalCurrency, displayCurrency)
        : project.projectPrice,
      partnerShareAmount: project.partnerShareAmount
        ? convertCurrency(project.partnerShareAmount, originalCurrency, displayCurrency)
        : 0,
    };
  }, [project, displayCurrency]);

  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[900px] p-0 mt-12"
    >
      <div className="flex flex-col max-h-[92vh]">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 pr-16 sm:pr-20 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
              Project Details
            </h4>
            <div className="flex items-center gap-3">
              <Label className="text-sm">Display Currency:</Label>
              <select
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value)}
                className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                {Object.entries(CURRENCY_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-6">
          {/* Project Title and Status */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {project.projectTitle}
            </h3>
            <Badge size="sm" color={getStatusColor(project.status)}>
              {project.status}
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
                  <Label className="text-xs">Project Price</Label>
                  <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {formatPrice(convertedAmounts?.projectPrice || 0, displayCurrency)}
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({formatPrice(project.projectPrice, project.priceType)} original)
                    </span>
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Platform Fee</Label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {project.platformFeePercentage}% ({formatPrice(convertedAmounts?.platformFeeAmount || 0, displayCurrency)})
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({formatPrice(project.platformFeeAmount || 0, project.priceType)} original)
                    </span>
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Charity</Label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {project.includeCharity ? (
                      <>
                        <span className="text-green-600 dark:text-green-400">Enabled</span>
                        <span className="ml-2">5% ({formatPrice(convertedAmounts?.charityAmount || 0, displayCurrency)})</span>
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          ({formatPrice(project.charityAmount || 0, project.priceType)} original)
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">Disabled</span>
                    )}
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Final Amount</Label>
                  <p className="mt-1 text-xl font-bold text-brand-600 dark:text-brand-400">
                    {formatPrice(convertedAmounts?.finalAmount || 0, displayCurrency)}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({formatPrice(project.finalAmount || project.projectPrice, project.priceType)} original)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h5 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Project Information
              </h5>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Platform Name</Label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {project.platformName}
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Start Date</Label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {project.projectStartDate}
                  </p>
                </div>

                {project.projectEndDate && (
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                      {project.projectEndDate}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Original Currency</Label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {CURRENCY_NAMES[project.priceType] || project.priceType}
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Charity Deduction</Label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {project.includeCharity ? (
                      <span className="text-green-600 dark:text-green-400">Enabled (5%)</span>
                    ) : (
                      <span className="text-gray-400">Disabled</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calculated Amounts Breakdown */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h5 className="mb-4 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Complete Amount Breakdown ({CURRENCY_NAMES[displayCurrency]})
            </h5>
            <div className="space-y-3">
              {/* Step 1: Project Price */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                <Label className="text-xs font-medium">Project Price</Label>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {formatPrice(convertedAmounts?.totalAmount || 0, displayCurrency)}
                </p>
              </div>

              {/* Step 2: Platform Fee */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                <div>
                  <Label className="text-xs font-medium">Platform Fee ({project.platformFeePercentage}%)</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">- Deducted</p>
                </div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  -{formatPrice(convertedAmounts?.platformFeeAmount || 0, displayCurrency)}
                </p>
              </div>

              {/* Step 3: After Platform Fee */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                <Label className="text-xs font-medium">After Platform Fee</Label>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {formatPrice(convertedAmounts?.afterPlatformFee || 0, displayCurrency)}
                </p>
              </div>

              {/* Step 4: Withdrawal Fees (Expenses) */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                <div>
                  <Label className="text-xs font-medium">Withdrawal Fees (Expenses)</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">- Deducted</p>
                </div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  -{formatPrice(convertedAmounts?.withdrawalFees || 0, displayCurrency)}
                </p>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                <Label className="text-xs font-medium">Final Amount After Expenses</Label>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {formatPrice(convertedAmounts?.finalAmountAfterExpenses || 0, displayCurrency)}
                </p>
              </div>

              {/* Step 5: Charity (if enabled) */}
              {project.includeCharity && (
                <>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                    <div>
                      <Label className="text-xs font-medium">Charity (5% of After Withdrawal Fees)</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">- Deducted</p>
                    </div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      -{formatPrice(convertedAmounts?.charityAmount || 0, displayCurrency)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                    <Label className="text-xs font-medium">After Charity</Label>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {formatPrice(convertedAmounts?.afterCharity || 0, displayCurrency)}
                    </p>
                  </div>
                </>
              )}

              {/* Partner Share Rows (informational) */}
              {project.partners && project.partners.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between border-t border-gray-200 pb-2 pt-2 dark:border-gray-700">
                    <div>
                      <Label className="text-xs font-medium">Partner Share Amount</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total to be distributed (after expenses)</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {formatPrice(convertedAmounts?.partnerShareAmount || 0, displayCurrency)}
                    </p>
                  </div>
                  {project.partners.map((partner) => {
                    const partnerAmount =
                      convertedAmounts?.partnerShareAmount
                        ? (convertedAmounts.partnerShareAmount * partner.sharePercentage) / 100
                        : 0;
                    return (
                      <div
                        key={partner.id}
                        className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700"
                      >
                        <Label className="text-xs font-medium">
                          {partner.name} ({partner.sharePercentage}%)
                        </Label>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                          {formatPrice(partnerAmount, displayCurrency)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

            {/* Note about exchange rates */}
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Currency conversion is for display purposes only and uses approximate exchange rates. 
                Actual rates may vary.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 px-5 pt-4 pb-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
          <div className="flex w-full items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

