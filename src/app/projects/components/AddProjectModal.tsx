"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import ProjectForm, { ProjectFormData } from "./ProjectForm";
import { PlatformSettings } from "@/lib/api/platformSettings";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ProjectFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
  platformSettings?: PlatformSettings[];
  onPlatformChange?: (platformName: string, feePercentage: number) => void;
}

export default function AddProjectModal({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSubmit,
  platformSettings,
  onPlatformChange,
}: AddProjectModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[1000px] p-5 lg:p-10 mt-20"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          Add New Project
        </h4>

        <ProjectForm 
          formData={formData} 
          onInputChange={onInputChange}
          platformSettings={platformSettings}
          onPlatformChange={onPlatformChange}
        />

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
            Add Project
          </button>
        </div>
      </form>
    </Modal>
  );
}

