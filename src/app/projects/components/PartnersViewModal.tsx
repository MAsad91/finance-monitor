"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Project } from "../types";

interface PartnersViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onAddPartner: () => void;
  onEditPartner: (partnerIndex: number) => void;
  onDeletePartner: (partnerIndex: number | number[]) => void;
}

export default function PartnersViewModal({
  isOpen,
  onClose,
  project,
  onAddPartner,
  onEditPartner,
  onDeletePartner,
}: PartnersViewModalProps) {
  const [selectedPartners, setSelectedPartners] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Reset selections when modal opens/closes or project changes
    setSelectedPartners(new Set());
  }, [isOpen, project?.id]);

  if (!project) return null;

  const totalShare = project.partners.reduce((sum, p) => sum + p.sharePercentage, 0);
  const allSelected = project.partners.length > 0 && selectedPartners.size === project.partners.length;
  const someSelected = selectedPartners.size > 0;

  const handleToggleSelect = (index: number) => {
    setSelectedPartners((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedPartners(new Set());
    } else {
      setSelectedPartners(new Set(project.partners.map((_, index) => index)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPartners.size === 0) return;
    
    const indicesToDelete = Array.from(selectedPartners);
    onDeletePartner(indicesToDelete);
    setSelectedPartners(new Set());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] p-5 lg:p-10"
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
              Partners - {project.projectTitle}
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage partners and their share percentages
            </p>
          </div>
          {project.partners.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
              {someSelected && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Delete Selected ({selectedPartners.size})
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {project.partners.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No partners added yet
              </p>
            </div>
          ) : (
            project.partners.map((partner, index) => {
              const isSelected = selectedPartners.has(index);
              return (
                <div
                  key={partner.id}
                  className={`flex items-center gap-3 rounded-lg border p-4 transition ${
                    isSelected
                      ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20"
                      : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(index)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {partner.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {partner.sharePercentage}% share
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPartner(index);
                        onClose();
                      }}
                      className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Edit Partner"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePartner(index);
                      }}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete Partner"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalShare < 100 && project.partners.length > 0 && (
          <div className="mt-4 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              <strong>Note:</strong> {100 - totalShare}% share remaining
            </p>
          </div>
        )}

        <div className="mt-6 flex w-full items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onAddPartner();
              onClose();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Partner
          </button>
        </div>
      </div>
    </Modal>
  );
}

