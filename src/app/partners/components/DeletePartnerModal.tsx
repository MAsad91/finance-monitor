"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Partner } from "@/lib/api/partners";

interface DeletePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
  onConfirm: () => void;
}

export default function DeletePartnerModal({
  isOpen,
  onClose,
  partner,
  onConfirm,
}: DeletePartnerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[500px] p-5 lg:p-10"
    >
      <div>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Delete Partner
        </h4>
        <p className="mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400">
          Are you sure you want to delete the partner{" "}
          <span className="font-semibold text-gray-800 dark:text-white/90">
            "{partner?.name}"
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex w-full items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

