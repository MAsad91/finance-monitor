"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import ExpenseForm from "./ExpenseForm";
import { ExpenseFormData } from "../types";
import { Project } from "@/app/projects/types";

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ExpenseFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  projects: Project[];
  onProjectSelectionChange: (ids: string[]) => void;
  onSubmit: () => void;
  expenseId?: string;
}

export default function EditExpenseModal({
  isOpen,
  onClose,
  formData,
  onInputChange,
  projects,
  onProjectSelectionChange,
  onSubmit,
  expenseId,
}: EditExpenseModalProps) {
  const [localFormData, setLocalFormData] = useState<ExpenseFormData>(formData);

  useEffect(() => {
    if (isOpen && formData) {
      setLocalFormData(formData);
    }
  }, [isOpen, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setLocalFormData((prev) => {
      const { name, value, type } = e.target;
      if (type === "checkbox") {
        return { ...prev, [name]: (e.target as HTMLInputElement).checked };
      }
      return { ...prev, [name]: value };
    });
    onInputChange(e);
  };

  const handleProjectSelectionChange = (ids: string[]) => {
    setLocalFormData((prev) => ({ ...prev, projectIds: ids }));
    onProjectSelectionChange(ids);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[1200px] p-5 lg:p-10 mt-32 max-h-[90vh] overflow-y-auto"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex flex-col"
      >
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          Edit Expense
        </h4>

        <div className="flex-1 overflow-y-auto pr-2">
          <ExpenseForm
            key={expenseId || formData.name}
            formData={localFormData}
            onInputChange={handleInputChange}
            projects={projects}
            onProjectSelectionChange={handleProjectSelectionChange}
          />
        </div>

        <div className="mt-6 flex w-full items-center justify-end gap-3 flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4">
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
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

