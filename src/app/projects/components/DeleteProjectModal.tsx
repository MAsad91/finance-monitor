"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { Project } from "../types";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onConfirm: () => void;
}

export default function DeleteProjectModal({
  isOpen,
  onClose,
  project,
  onConfirm,
}: DeleteProjectModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[500px] p-5 lg:p-10"
    >
      <div>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Delete Project
        </h4>
        <p className="mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400">
          Are you sure you want to delete the project{" "}
          <span className="font-semibold text-gray-800 dark:text-white/90">
            "{project?.projectTitle}"
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex w-full items-center justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className="!bg-error-500 !text-white hover:!bg-error-600"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

