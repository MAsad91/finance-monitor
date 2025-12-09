"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";

interface PartnerFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  status: "Active" | "Inactive";
  joinDate: string;
}

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PartnerFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
  submitting?: boolean;
}

export default function AddPartnerModal({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSubmit,
  submitting = false,
}: AddPartnerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          Add New Partner
        </h4>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>
              Name <span className="text-error-500">*</span>
            </Label>
            <input
              type="text"
              name="name"
              placeholder="Enter partner name"
              value={formData.name}
              onChange={onInputChange}
              required
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>

          <div className="col-span-1">
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <input
              type="email"
              name="email"
              placeholder="partner@example.com"
              value={formData.email}
              onChange={onInputChange}
              required
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>

          <div className="col-span-1">
            <Label>
              Company <span className="text-error-500">*</span>
            </Label>
            <input
              type="text"
              name="company"
              placeholder="Company name"
              value={formData.company}
              onChange={onInputChange}
              required
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>

          <div className="col-span-1">
            <Label>Phone</Label>
            <input
              type="tel"
              name="phone"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={onInputChange}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="col-span-1">
            <Label>
              Join Date <span className="text-error-500">*</span>
            </Label>
            <input
              type="date"
              name="joinDate"
              value={formData.joinDate}
              onChange={onInputChange}
              required
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
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
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                Adding...
              </>
            ) : (
              "Add Partner"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

