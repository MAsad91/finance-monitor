"use client";

import React, { useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Partner } from "@/lib/api/partners";
import { Project } from "@/app/projects/types";

// Exchange rates relative to INR
const EXCHANGE_RATES: { [key: string]: number } = {
  inr: 1,
  dollars: 0.012,
  euro: 0.011,
  pkr: 3.33,
  gbp: 0.0095,
  cad: 0.016,
  aud: 0.018,
};

// Convert currency function - converts between any two currencies via INR
const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const normalizeCurrency = (curr: string): string => {
    const normalized = curr.toLowerCase();
    if (normalized === "dollars" || normalized === "dollar") return "dollars";
    return normalized;
  };

  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);

  if (from === to) return amount;

  // Convert to INR first
  let amountInINR: number;
  if (from === "inr") {
    amountInINR = amount;
  } else {
    const rateToINR = 1 / EXCHANGE_RATES[from];
    amountInINR = amount * rateToINR;
  }

  // Convert from INR to target currency
  if (to === "inr") {
    return amountInINR;
  } else {
    return amountInINR * EXCHANGE_RATES[to];
  }
};

interface PartnerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
  projects: Project[];
  onEdit: () => void;
  onDelete: () => void;
  formatPrice: (price: number, type: string) => string;
}

const getStatusColor = (status: string) => {
  return status === "Active" ? "success" : "warning";
};

export default function PartnerDetailModal({
  isOpen,
  onClose,
  partner,
  projects,
  onEdit,
  onDelete,
  formatPrice,
}: PartnerDetailModalProps) {
  // Calculate partner shares from projects
  const partnerShares = useMemo(() => {
    if (!partner || !projects) return [];
    
    return projects
      .filter((project) => {
        return project.partners.some(
          (p) => p.partnerId === partner.id || p.name === partner.name
        );
      })
      .map((project) => {
        const partnerInProject = project.partners.find(
          (p) => p.partnerId === partner.id || p.name === partner.name
        );
        
        if (!partnerInProject || !project.finalAmount) return null;
        
        // Calculate share in project's currency
        const shareAmount = (project.finalAmount * partnerInProject.sharePercentage) / 100;
        
        // Convert to PKR for display
        const shareAmountInPKR = convertCurrency(shareAmount, project.priceType, "pkr");
        
        return {
          projectId: project.id,
          projectTitle: project.projectTitle,
          sharePercentage: partnerInProject.sharePercentage,
          shareAmount,
          shareAmountInPKR,
          currency: project.priceType,
          finalAmount: project.finalAmount,
        };
      })
      .filter((share) => share !== null) as Array<{
        projectId: string;
        projectTitle: string;
        sharePercentage: number;
        shareAmount: number;
        shareAmountInPKR: number;
        currency: string;
        finalAmount: number;
      }>;
  }, [partner, projects]);

  const totalShareAmount = useMemo(() => {
    if (partnerShares.length === 0) return 0;
    // Sum all shares in PKR
    return partnerShares.reduce((sum, share) => sum + share.shareAmountInPKR, 0);
  }, [partnerShares]);

  if (!partner) return null;

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
            <div>
              <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                {partner.name}
              </h4>
              <div className="mt-2">
                <Badge size="sm" color={getStatusColor(partner.status)}>
                  {partner.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onEdit}>
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDelete}
                className="!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Partner Details Grid - First Row: Two Columns */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
            {/* Contact Information */}
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h4 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Contact Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {partner.name}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {partner.email}
                  </p>
                </div>

                {partner.phone && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Phone
                    </label>
                    <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                      {partner.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Company & Additional Information Combined */}
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h4 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Company Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Company
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {partner.company}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 mb-3">
                  Additional Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge size="sm" color={getStatusColor(partner.status)}>
                        {partner.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Join Date
                    </label>
                    <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                      {partner.joinDate}
                    </p>
                  </div>

                  {partner.createdAt && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Created At
                      </label>
                      <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                        {new Date(partner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {partner.updatedAt && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Last Updated
                      </label>
                      <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                        {new Date(partner.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shares Information - Full Width */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="mb-4 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Project Shares
            </h4>
            {partnerShares.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No project shares found for this partner.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                          Project
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                          Share %
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                          Project Total
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                          Share Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {partnerShares.map((share) => (
                        <tr
                          key={share.projectId}
                          className="border-b border-gray-100 dark:border-gray-800"
                        >
                          <td className="py-2 px-3 text-gray-800 dark:text-white/90">
                            {share.projectTitle}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                            {share.sharePercentage.toFixed(2)}%
                          </td>
                          <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                            {formatPrice(share.finalAmount, share.currency)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-800 dark:text-white/90">
                            {formatPrice(share.shareAmountInPKR, "pkr")}
                            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                              ({formatPrice(share.shareAmount, share.currency)})
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900/50">
                        <td className="py-3 px-3 font-semibold text-gray-800 dark:text-white/90">
                          Total
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-gray-800 dark:text-white/90">
                          {partnerShares.reduce((sum, s) => sum + s.sharePercentage, 0).toFixed(2)}%
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-gray-800 dark:text-white/90">
                          {partnerShares.length > 0 && formatPrice(
                            partnerShares.reduce((sum, s) => {
                              const finalAmountInPKR = convertCurrency(s.finalAmount, s.currency, "pkr");
                              return sum + finalAmountInPKR;
                            }, 0),
                            "pkr"
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-brand-600 dark:text-brand-400">
                          {formatPrice(totalShareAmount, "pkr")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
          <div className="flex items-center justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

