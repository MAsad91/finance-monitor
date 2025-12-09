"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Project } from "../types";
import { partnersApi, Partner } from "@/lib/api/partners";

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  selectedPartnerId: string;
  sharePercentage: string;
  onPartnerChange: (partnerId: string) => void;
  onSharePercentageChange: (value: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
  includeCharity?: boolean;
  onCharityChange?: (includeCharity: boolean) => void;
}

export default function PartnerModal({
  isOpen,
  onClose,
  project,
  selectedPartnerId,
  sharePercentage,
  onPartnerChange,
  onSharePercentageChange,
  onSubmit,
  isEditing,
  includeCharity = false,
  onCharityChange,
}: PartnerModalProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPartners();
    }
  }, [isOpen]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await partnersApi.getAll();
      if (error) {
        console.error("Error fetching partners:", error);
      } else {
        setPartners(data || []);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentTotalShare = project
    ? project.partners.reduce((sum, p) => sum + p.sharePercentage, 0)
    : 0;

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId);

  // Calculate breakdown - order: Platform Fee -> Withdrawal Fees -> Charity
  const calculateBreakdown = () => {
    if (!project) return null;

    const projectPrice = project.projectPrice || 0;
    const platformFeePercentage = project.platformFeePercentage || 0;
    const platformFeeAmount = project.platformFeeAmount || (projectPrice * platformFeePercentage) / 100;
    const afterPlatformFee = project.afterPlatformFee || (projectPrice - platformFeeAmount);
    const withdrawalFees = project.allocatedExpenses || 0;
    const afterWithdrawalFees = afterPlatformFee - withdrawalFees;

    const baseForCharity = Math.max(afterWithdrawalFees, 0);
    const charityAmount = includeCharity ? (baseForCharity * 5) / 100 : 0;
    const afterCharity = afterWithdrawalFees - charityAmount;
    const finalAmount = afterCharity;

    return {
      projectPrice,
      platformFeePercentage,
      platformFeeAmount,
      afterPlatformFee,
      withdrawalFees,
      afterWithdrawalFees,
      charityAmount,
      afterCharity,
      finalAmount,
    };
  };

  const breakdown = calculateBreakdown();
  const formatPrice = (amount: number) => {
    const currencySymbols: { [key: string]: string } = {
      inr: "₹",
      dollars: "$",
      euro: "€",
      pkr: "₨",
      gbp: "£",
      cad: "C$",
      aud: "A$",
    };
    const symbol = currencySymbols[project?.priceType || "dollars"] || "$";
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[500px] p-5 lg:p-10"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {isEditing ? "Edit Partner" : "Add Partner"}
        </h4>

        {/* Charity Checkbox */}
        {project && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <input
              type="checkbox"
              id="includeCharity"
              checked={includeCharity}
              onChange={(e) => {
                if (onCharityChange) {
                  onCharityChange(e.target.checked);
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label
              htmlFor="includeCharity"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Include 5% Charity Deduction
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (5% of amount after platform fee will be deducted for charity)
            </span>
          </div>
        )}

        {/* Calculation Breakdown */}
        {project && breakdown && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h5 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
              Calculation Breakdown
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Project Price:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">{formatPrice(breakdown.projectPrice)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                <span className="text-gray-600 dark:text-gray-400">Platform Fee ({breakdown.platformFeePercentage}%):</span>
                <span className="font-medium text-red-600 dark:text-red-400">-{formatPrice(breakdown.platformFeeAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">After Platform Fee:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">{formatPrice(breakdown.afterPlatformFee)}</span>
              </div>
              {breakdown.withdrawalFees > 0 && (
                <>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Withdrawal Fees:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">-{formatPrice(breakdown.withdrawalFees)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">After Withdrawal Fees:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">{formatPrice(breakdown.afterWithdrawalFees)}</span>
              </div>
              {includeCharity && (
                <>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Charity (5% of After Withdrawal Fees):</span>
                    <span className="font-medium text-red-600 dark:text-red-400">-{formatPrice(breakdown.charityAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">After Charity:</span>
                    <span className="font-medium text-gray-800 dark:text-white/90">{formatPrice(breakdown.afterCharity)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t-2 border-blue-300 dark:border-blue-700 pt-2">
                <span className="font-semibold text-gray-800 dark:text-white/90">Final Amount:</span>
                <span className="font-bold text-green-600 dark:text-green-400">{formatPrice(breakdown.finalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-y-5">
          <div>
            <Label>
              Partner <span className="text-error-500">*</span>
            </Label>
            <select
              name="partnerId"
              value={selectedPartnerId}
              onChange={(e) => onPartnerChange(e.target.value)}
              required
              disabled={loading || isEditing}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select a partner</option>
              <option value="__select_all__" className="font-semibold">
                ── Select All Partners ──
              </option>
              {partners
                .filter((p) => p.status === "Active")
                .map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name} {partner.company ? `(${partner.company})` : ""}
                  </option>
                ))}
            </select>
            {loading && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Loading partners...
              </p>
            )}
            {selectedPartner && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {selectedPartner.email}
              </p>
            )}
            {selectedPartnerId === "__select_all__" && (
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                All active partners will be added
              </p>
            )}
          </div>

          {selectedPartnerId !== "__select_all__" && (
            <div>
              <Label>
                Share Percentage <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <input
                  type="number"
                  name="sharePercentage"
                  placeholder="0"
                  value={sharePercentage}
                  onChange={(e) => onSharePercentageChange(e.target.value)}
                  required
                  step="0.01"
                  min="0"
                  max="100"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              {project && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Current total: {currentTotalShare}% / 100%
                </p>
              )}
            </div>
          )}
          {selectedPartnerId === "__select_all__" && project && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> All active partners will be added to this project. The remaining share percentage ({100 - currentTotalShare}%) will be divided equally among all new partners.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex w-full items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEditing ? "Update Partner" : "Add Partner"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
