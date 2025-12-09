"use client";

import React from "react";
import Label from "@/components/form/Label";
import { ExpenseFormData } from "../types";
import { Project } from "@/app/projects/types";
import Select from "react-select";

export type { ExpenseFormData };

interface ExpenseFormProps {
  formData: ExpenseFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  projects: Project[];
  onProjectSelectionChange: (ids: string[]) => void;
}

export default function ExpenseForm({
  formData,
  onInputChange,
  projects,
  onProjectSelectionChange,
}: ExpenseFormProps) {
  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: project.projectTitle,
  }));

  const selectedProjects = projectOptions.filter((option) =>
    formData.projectIds.includes(option.value)
  );

  const handleProjectSelect = (selected: any) => {
    const selectedIds = selected ? selected.map((option: any) => option.value) : [];
    onProjectSelectionChange(selectedIds);
  };

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
      <div className="col-span-1 sm:col-span-3">
        <Label>
          Expense Name <span className="text-error-500">*</span>
        </Label>
        <input
          type="text"
          name="name"
          placeholder="e.g., Cursor Subscription, Freelancer Platform"
          value={formData.name}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1 sm:col-span-1">
        <Label>
          Category <span className="text-error-500">*</span>
        </Label>
        <input
          type="text"
          name="category"
          placeholder="e.g., Cursor, Freelancer, Hosting"
          value={formData.category}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1 sm:col-span-1">
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

      <div className="col-span-1 sm:col-span-1">
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

      <div className="col-span-1 sm:col-span-3">
        <Label>Attach to Projects</Label>
        {projects.length > 0 ? (
          <Select
            isMulti
            options={projectOptions}
            value={selectedProjects}
            onChange={handleProjectSelect}
            placeholder="Select projects to attach this expense..."
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => {
                const isDark = document.documentElement.classList.contains("dark");
                return {
                  ...base,
                  minHeight: "44px",
                  borderColor: state.isFocused
                    ? "rgb(59 130 246)"
                    : isDark
                    ? "rgb(55 65 81)"
                    : "rgb(209 213 219)",
                  boxShadow: state.isFocused
                    ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                    : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  backgroundColor: isDark ? "rgb(17 24 39)" : "transparent",
                  color: isDark ? "rgb(229 231 235)" : "inherit",
                  "&:hover": {
                    borderColor: "rgb(59 130 246)",
                  },
                };
              },
              menu: (base) => {
                const isDark = document.documentElement.classList.contains("dark");
                return {
                  ...base,
                  zIndex: 9999,
                  maxHeight: "200px",
                  overflowY: "auto",
                  backgroundColor: isDark ? "rgb(17 24 39)" : "white",
                };
              },
              option: (base, state) => {
                const isDark = document.documentElement.classList.contains("dark");
                return {
                  ...base,
                  backgroundColor: state.isSelected
                    ? "rgb(59 130 246)"
                    : state.isFocused
                    ? isDark
                      ? "rgb(31 41 55)"
                      : "rgb(59 130 246 / 0.1)"
                    : isDark
                    ? "rgb(17 24 39)"
                    : "white",
                  color: state.isSelected
                    ? "white"
                    : isDark
                    ? "rgb(229 231 235)"
                    : "inherit",
                  "&:active": {
                    backgroundColor: "rgb(59 130 246)",
                  },
                };
              },
              input: (base) => {
                const isDark = document.documentElement.classList.contains("dark");
                return {
                  ...base,
                  color: isDark ? "rgb(229 231 235)" : "inherit",
                };
              },
              multiValue: (base) => ({
                ...base,
                backgroundColor: "rgb(59 130 246 / 0.1)",
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: "rgb(59 130 246)",
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: "rgb(59 130 246)",
                "&:hover": {
                  backgroundColor: "rgb(59 130 246 / 0.2)",
                  color: "rgb(59 130 246)",
                },
              }),
              placeholder: (base) => {
                const isDark = document.documentElement.classList.contains("dark");
                return {
                  ...base,
                  color: isDark ? "rgb(156 163 175)" : "rgb(156 163 175)",
                };
              },
            }}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: "rgb(59 130 246)",
                primary25: "rgb(59 130 246 / 0.1)",
                primary50: "rgb(59 130 246 / 0.2)",
                primary75: "rgb(59 130 246 / 0.3)",
              },
            })}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No projects available yet. Add a project first to link expenses.
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Selected projects will have this expense deducted during their next balance recalculation.
        </p>
      </div>

      <div className="col-span-1">
        <Label>
          Payment Type <span className="text-error-500">*</span>
        </Label>
        <select
          name="paymentType"
          value={formData.paymentType}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="quarterly">Quarterly</option>
          <option value="bi-annual">Bi-Annual</option>
          <option value="one-time">One-time</option>
        </select>
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
          <option value="Active">Active</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="col-span-1">
        <Label>
          Payment Date <span className="text-error-500">*</span>
        </Label>
        <input
          type="date"
          name="paymentDate"
          value={formData.paymentDate}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>
          Start Date <span className="text-error-500">*</span>
        </Label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={onInputChange}
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1">
        <Label>End Date</Label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={onInputChange}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="col-span-1 sm:col-span-3">
        <Label>Notes</Label>
        <textarea
          name="notes"
          placeholder="Additional notes about this expense..."
          value={formData.notes}
          onChange={onInputChange}
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>
    </div>
  );
}

