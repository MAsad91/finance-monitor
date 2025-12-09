"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import ProjectForm, { ProjectFormData } from "./ProjectForm";
import { PlatformSettings } from "@/lib/api/platformSettings";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ProjectFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
  platformSettings?: PlatformSettings[];
  onPlatformChange?: (platformName: string, feePercentage: number) => void;
  projectId?: string;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSubmit,
  platformSettings,
  onPlatformChange,
  projectId,
}: EditProjectModalProps) {
  const [localFormData, setLocalFormData] = useState<ProjectFormData>(formData);

  useEffect(() => {
    if (isOpen && formData) {
      setLocalFormData(formData);
    }
  }, [isOpen, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setLocalFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // Handle nested withdrawal fees fields
      if (name.startsWith("withdrawalFees.")) {
        const parts = name.split(".");
        if (parts.length === 3) {
          const [_, feeType, field] = parts;
          setLocalFormData((prev) => ({
            ...prev,
            withdrawalFees: {
              ...prev.withdrawalFees,
              [feeType]: {
                ...prev.withdrawalFees[feeType as keyof typeof prev.withdrawalFees],
                [field]: value,
              },
            },
          }));
        }
      } else {
        setLocalFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
    onInputChange(e);
  };

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
          Edit Project
        </h4>

        <ProjectForm 
          key={projectId || formData.projectTitle}
          formData={localFormData} 
          onInputChange={handleInputChange}
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
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

