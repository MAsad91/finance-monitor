"use client";

import React from "react";
import Label from "@/components/form/Label";
import { PlatformSettings } from "@/lib/api/platformSettings";

interface ProjectFormData {
  projectTitle: string;
  projectPrice: string;
  priceType: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  platformFeePercentage: string; // Changed to percentage
  platformName: string;
  projectStartDate: string;
  projectEndDate: string;
  status: "Completed" | "in progress" | "Active" | "Inactive";
  includeCharity: boolean;
  isCustomPlatform: boolean; // Whether "Other" platform is selected
  withdrawalFees: {
    platformToPayoneer: { amount: string; currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud" };
    platformToLocalBank: { amount: string; currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud" };
    payoneerToLocalBank: { amount: string; currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud" };
  };
}

interface ProjectFormProps {
  formData: ProjectFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  platformSettings?: PlatformSettings[];
  onPlatformChange?: (platformName: string, feePercentage: number, withdrawalFees?: PlatformSettings['withdrawalFees']) => void;
}

export default function ProjectForm({ 
  formData, 
  onInputChange, 
  platformSettings = [],
  onPlatformChange 
}: ProjectFormProps) {
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlatformName = e.target.value;
    const isCustom = selectedPlatformName === "__other__";
    
    // Update platformName and isCustomPlatform
    if (isCustom) {
      // For "Other", clear platform name and set isCustomPlatform to true
      const nameEvent = {
        ...e,
        target: { ...e.target, name: "platformName", value: "" },
      } as React.ChangeEvent<HTMLSelectElement>;
      const customEvent = {
        ...e,
        target: { ...e.target, name: "isCustomPlatform", value: "true", type: "checkbox" },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onInputChange(nameEvent);
      onInputChange(customEvent);
      if (onPlatformChange) {
        onPlatformChange("", 0, undefined);
      }
    } else {
      // For selected platform, update platformName and set isCustomPlatform to false
      const nameEvent = {
        ...e,
        target: { ...e.target, name: "platformName", value: selectedPlatformName },
      } as React.ChangeEvent<HTMLSelectElement>;
      const customEvent = {
        ...e,
        target: { ...e.target, name: "isCustomPlatform", value: "false", type: "checkbox" },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onInputChange(nameEvent);
      onInputChange(customEvent);
      
      // Auto-populate fee and withdrawal fees from platform settings
      const platform = safePlatformSettings.find(
        (p) => p.platformName.toLowerCase() === selectedPlatformName.toLowerCase()
      );
      
      if (platform && onPlatformChange) {
        onPlatformChange(platform.platformName, platform.platformFeePercentage, platform.withdrawalFees);
      }
    }
  };

  // Ensure platformSettings is always an array
  const safePlatformSettings = Array.isArray(platformSettings) ? platformSettings : [];
  const wellKnownPlatforms = safePlatformSettings.filter((p) => !p.isCustom);
  const customPlatforms = safePlatformSettings.filter((p) => p.isCustom);

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* First Row: 4 fields */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-4">
        <Label>
          Project Title <span className="text-error-500">*</span>
        </Label>
        <input
          type="text"
          name="projectTitle"
          placeholder="Enter project title"
          value={formData.projectTitle}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>
          Project Price <span className="text-error-500">*</span>
        </Label>
        <input
          type="number"
          name="projectPrice"
          placeholder="0.00"
          value={formData.projectPrice}
          onChange={onInputChange}
          required
          step="0.01"
          min="0"
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>
          Price Type <span className="text-error-500">*</span>
        </Label>
        <select
          name="priceType"
          value={formData.priceType}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="inr">INR</option>
          <option value="dollars">USD (Dollars)</option>
          <option value="euro">EUR (Euro)</option>
          <option value="pkr">PKR (Pakistani Rupee)</option>
          <option value="gbp">GBP (British Pound)</option>
          <option value="cad">CAD (Canadian Dollar)</option>
          <option value="aud">AUD (Australian Dollar)</option>
        </select>
      </div>

      {/* Only show Platform Fee input when a platform is selected (not "Other") */}
      {!formData.isCustomPlatform && formData.platformName && (
        <div className="col-span-1">
          <Label>
            Platform Fee (%) <span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <input
              type="number"
              name="platformFeePercentage"
              placeholder="0.00"
              value={formData.platformFeePercentage}
              onChange={onInputChange}
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
        </div>
      )}

      <div className="col-span-1 sm:col-span-2">
        <Label>
          Platform <span className="text-error-500">*</span>
        </Label>
        <select
          name="platformName"
          value={formData.isCustomPlatform ? "__other__" : formData.platformName}
          onChange={handlePlatformChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="">Select a platform</option>
          {wellKnownPlatforms.length > 0 && (
            <>
              {wellKnownPlatforms.map((platform) => (
                <option key={platform.id} value={platform.platformName}>
                  {platform.platformName}
                </option>
              ))}
            </>
          )}
          {customPlatforms.length > 0 && (
            <>
              {customPlatforms.map((platform) => (
                <option key={platform.id} value={platform.platformName}>
                  {platform.platformName} (Custom)
                </option>
              ))}
            </>
          )}
          <option value="__other__">── Other ──</option>
        </select>
        {/* Display platform settings when a platform is selected (not "Other") */}
        {!formData.isCustomPlatform && formData.platformName && (
          <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Platform Settings Applied:
            </p>
            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
              <p>Platform Fee: {formData.platformFeePercentage}%</p>
              {(formData.withdrawalFees.platformToPayoneer.amount ||
                formData.withdrawalFees.platformToLocalBank.amount ||
                formData.withdrawalFees.payoneerToLocalBank.amount) && (
                <div className="mt-2 pt-2 border-t border-blue-300 dark:border-blue-700">
                  <p className="font-semibold mb-1">Withdrawal Fees:</p>
                  {formData.withdrawalFees.platformToPayoneer.amount && (
                    <p>
                      Platform → Payoneer: {formData.withdrawalFees.platformToPayoneer.amount}{" "}
                      {formData.withdrawalFees.platformToPayoneer.currency.toUpperCase()}
                    </p>
                  )}
                  {formData.withdrawalFees.platformToLocalBank.amount && (
                    <p>
                      Platform → Local Bank: {formData.withdrawalFees.platformToLocalBank.amount}{" "}
                      {formData.withdrawalFees.platformToLocalBank.currency.toUpperCase()}
                    </p>
                  )}
                  {formData.withdrawalFees.payoneerToLocalBank.amount && (
                    <p>
                      Payoneer → Local Bank: {formData.withdrawalFees.payoneerToLocalBank.amount}{" "}
                      {formData.withdrawalFees.payoneerToLocalBank.currency.toUpperCase()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {formData.isCustomPlatform && (
          <input
            type="text"
            name="platformName"
            placeholder="Enter platform name"
            value={formData.platformName}
            onChange={onInputChange}
            required
            className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        )}
      </div>


      <div className="col-span-1">
        <Label>
          Project Start Date <span className="text-error-500">*</span>
        </Label>
        <input
          type="date"
          name="projectStartDate"
          value={formData.projectStartDate}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>Project End Date</Label>
        <input
          type="date"
          name="projectEndDate"
          value={formData.projectEndDate}
          onChange={onInputChange}
          min={formData.projectStartDate}
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1 sm:col-span-2">
        <Label>
          Status <span className="text-error-500">*</span>
        </Label>
        <select
          name="status"
          value={formData.status}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="Active">Active</option>
          <option value="in progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="col-span-1 sm:col-span-2 lg:col-span-4">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <input
            type="checkbox"
            name="includeCharity"
            id="includeCharity"
            checked={!!formData.includeCharity}
            onChange={(e) => {
              const checked = e.target.checked;
              // Create a proper synthetic event that handleInputChange can process
              const syntheticEvent = {
                ...e,
                target: {
                  ...e.target,
                  name: "includeCharity",
                  type: "checkbox",
                  checked: checked,
                  value: checked ? "true" : "false",
                } as HTMLInputElement,
              } as React.ChangeEvent<HTMLInputElement>;
              onInputChange(syntheticEvent);
            }}
            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label
            htmlFor="includeCharity"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Include 10% Charity Deduction
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (5% of amount after platform fee will be deducted for charity)
          </span>
        </div>
      </div>
    </div>
  );
}

export type { ProjectFormData };

