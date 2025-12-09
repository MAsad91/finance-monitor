"use client";

import React from "react";
import Label from "@/components/form/Label";
import { WithdrawalFormData } from "../types";
import { Project } from "@/app/projects/types";

interface WithdrawalFormProps {
  formData: WithdrawalFormData;
  projects: Project[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onProjectToggle: (projectId: string) => void;
}

export default function WithdrawalForm({ 
  formData, 
  projects, 
  onInputChange,
  onProjectToggle 
}: WithdrawalFormProps) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
      <div className="col-span-1">
        <Label>
          Amount <span className="text-error-500">*</span>
        </Label>
        <input
          type="number"
          name="amount"
          placeholder="0.00"
          value={formData.amount}
          onChange={onInputChange}
          required
          step="0.01"
          min="0"
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>
          Currency <span className="text-error-500">*</span>
        </Label>
        <select
          name="currency"
          value={formData.currency}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="inr">INR (₹)</option>
          <option value="dollars">USD ($)</option>
          <option value="euro">EUR (€)</option>
          <option value="pkr">PKR (₨)</option>
          <option value="gbp">GBP (£)</option>
          <option value="cad">CAD (C$)</option>
          <option value="aud">AUD (A$)</option>
        </select>
      </div>

      <div className="col-span-1">
        <Label>
          Method <span className="text-error-500">*</span>
        </Label>
        <input
          type="text"
          name="method"
          placeholder="e.g., Bank Transfer, PayPal, Stripe"
          value={formData.method}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>
          Account <span className="text-error-500">*</span>
        </Label>
        <input
          type="text"
          name="account"
          placeholder="Account number or email"
          value={formData.account}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>
          Status <span className="text-error-500">*</span>
        </Label>
        <select
          name="status"
          value={formData.status}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      <div className="col-span-1">
        <Label>
          Request Date <span className="text-error-500">*</span>
        </Label>
        <input
          type="date"
          name="requestDate"
          value={formData.requestDate}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>Process Date</Label>
        <input
          type="date"
          name="processDate"
          value={formData.processDate}
          onChange={onInputChange}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>Withdrawal Fee</Label>
        <input
          type="number"
          name="withdrawalFee"
          placeholder="0.00"
          value={formData.withdrawalFee}
          onChange={onInputChange}
          step="0.01"
          min="0"
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>Withdrawal Fee Type</Label>
        <select
          name="withdrawalFeeType"
          value={formData.withdrawalFeeType}
          onChange={onInputChange}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="inr">INR (₹)</option>
          <option value="dollars">USD ($)</option>
          <option value="euro">EUR (€)</option>
          <option value="pkr">PKR (₨)</option>
          <option value="gbp">GBP (£)</option>
          <option value="cad">CAD (C$)</option>
          <option value="aud">AUD (A$)</option>
        </select>
      </div>

      <div className="col-span-1">
        <Label>Withdrawal Fee Local Account</Label>
        <input
          type="number"
          name="withdrawalFeeLocalAccount"
          placeholder="0.00"
          value={formData.withdrawalFeeLocalAccount}
          onChange={onInputChange}
          step="0.01"
          min="0"
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>Withdrawal Fee Local Account Type</Label>
        <select
          name="withdrawalFeeLocalAccountType"
          value={formData.withdrawalFeeLocalAccountType}
          onChange={onInputChange}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="inr">INR (₹)</option>
          <option value="dollars">USD ($)</option>
          <option value="euro">EUR (€)</option>
          <option value="pkr">PKR (₨)</option>
          <option value="gbp">GBP (£)</option>
          <option value="cad">CAD (C$)</option>
          <option value="aud">AUD (A$)</option>
        </select>
      </div>

      <div className="col-span-1 sm:col-span-2">
        <Label>
          Select Projects <span className="text-error-500">*</span>
        </Label>
        <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-300 p-3 dark:border-gray-700">
          {projects.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No projects available. Please create a project first.
            </p>
          ) : (
            projects.map((project) => (
              <label
                key={project.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <input
                  type="checkbox"
                  checked={formData.projectIds.includes(project.id)}
                  onChange={() => onProjectToggle(project.id)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {project.projectTitle}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {project.finalAmount?.toLocaleString()} {project.priceType.toUpperCase()}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="col-span-1 sm:col-span-2">
        <Label>Notes</Label>
        <textarea
          name="notes"
          placeholder="Additional notes about this withdrawal..."
          value={formData.notes}
          onChange={onInputChange}
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>
    </div>
  );
}

