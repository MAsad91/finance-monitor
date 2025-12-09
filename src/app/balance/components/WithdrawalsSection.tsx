"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { Withdrawal } from "@/lib/api/withdrawals";
import { Project } from "@/app/projects/types";
import WithdrawalForm from "@/app/withdraw/components/WithdrawalForm";
import { WithdrawalFormData } from "@/app/withdraw/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

interface WithdrawalsSectionProps {
  withdrawals: Withdrawal[];
  projects: Project[];
  onRefresh: () => void;
  formatPrice: (price: number, type: string) => string;
  getStatusColor: (status: string) => BadgeColor;
}

export default function WithdrawalsSection({
  withdrawals,
  projects,
  onRefresh,
  formatPrice,
  getStatusColor,
}: WithdrawalsSectionProps) {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const addModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  const [formData, setFormData] = useState<WithdrawalFormData>({
    amount: "",
    currency: "pkr",
    method: "",
    account: "",
    projectIds: [],
    withdrawalFee: "",
    withdrawalFeeType: "pkr",
    withdrawalFeeLocalAccount: "",
    withdrawalFeeLocalAccountType: "pkr",
    status: "Pending",
    requestDate: "",
    processDate: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      amount: "",
      currency: "pkr",
      method: "",
      account: "",
      projectIds: [],
      withdrawalFee: "",
      withdrawalFeeType: "pkr",
      withdrawalFeeLocalAccount: "",
      withdrawalFeeLocalAccountType: "pkr",
      status: "Pending",
      requestDate: "",
      processDate: "",
      notes: "",
    });
    setSelectedWithdrawal(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    addModal.openModal();
  };

  const handleOpenEdit = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setFormData({
      amount: withdrawal.amount.toString(),
      currency: withdrawal.currency,
      method: withdrawal.method,
      account: withdrawal.account,
      projectIds: withdrawal.projectIds || [],
      withdrawalFee: withdrawal.withdrawalFee?.toString() || "",
      withdrawalFeeType: withdrawal.withdrawalFeeType || "pkr",
      withdrawalFeeLocalAccount: withdrawal.withdrawalFeeLocalAccount?.toString() || "",
      withdrawalFeeLocalAccountType: withdrawal.withdrawalFeeLocalAccountType || "pkr",
      status: withdrawal.status,
      requestDate: withdrawal.requestDate,
      processDate: withdrawal.processDate || "",
      notes: withdrawal.notes || "",
    });
    editModal.openModal();
  };

  const handleOpenDelete = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    deleteModal.openModal();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectToggle = (projectId: string) => {
    setFormData((prev) => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter((id) => id !== projectId)
        : [...prev.projectIds, projectId],
    }));
  };

  const handleAddWithdrawal = async () => {
    if (submitting) return;
    if (!formData.amount || !formData.method || !formData.account || !formData.requestDate || formData.projectIds.length === 0) {
      alert("Please fill in all required fields and select at least one project");
      return;
    }

    try {
      setSubmitting(true);
      const { withdrawalsApi } = await import("@/lib/api/withdrawals");
      const { data, error } = await withdrawalsApi.create({
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        method: formData.method,
        account: formData.account,
        projectIds: formData.projectIds,
        withdrawalFee: formData.withdrawalFee ? parseFloat(formData.withdrawalFee) : undefined,
        withdrawalFeeType: formData.withdrawalFeeType || undefined,
        withdrawalFeeLocalAccount: formData.withdrawalFeeLocalAccount ? parseFloat(formData.withdrawalFeeLocalAccount) : undefined,
        withdrawalFeeLocalAccountType: formData.withdrawalFeeLocalAccountType || undefined,
        status: formData.status,
        requestDate: formData.requestDate,
        processDate: formData.processDate || undefined,
        notes: formData.notes || undefined,
      });

      if (error) {
        alert(`Failed to create withdrawal: ${error}`);
      } else {
        resetForm();
        addModal.closeModal();
        onRefresh();
      }
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      alert("Failed to create withdrawal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditWithdrawal = async () => {
    if (submitting || !selectedWithdrawal) return;
    if (!formData.amount || !formData.method || !formData.account || !formData.requestDate || formData.projectIds.length === 0) {
      alert("Please fill in all required fields and select at least one project");
      return;
    }

    try {
      setSubmitting(true);
      const { withdrawalsApi } = await import("@/lib/api/withdrawals");
      const { data, error } = await withdrawalsApi.update(selectedWithdrawal.id, {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        method: formData.method,
        account: formData.account,
        projectIds: formData.projectIds,
        withdrawalFee: formData.withdrawalFee ? parseFloat(formData.withdrawalFee) : undefined,
        withdrawalFeeType: formData.withdrawalFeeType || undefined,
        withdrawalFeeLocalAccount: formData.withdrawalFeeLocalAccount ? parseFloat(formData.withdrawalFeeLocalAccount) : undefined,
        withdrawalFeeLocalAccountType: formData.withdrawalFeeLocalAccountType || undefined,
        status: formData.status,
        requestDate: formData.requestDate,
        processDate: formData.processDate || undefined,
        notes: formData.notes || undefined,
      });

      if (error) {
        alert(`Failed to update withdrawal: ${error}`);
      } else {
        resetForm();
        editModal.closeModal();
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      alert("Failed to update withdrawal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWithdrawal = async () => {
    if (!selectedWithdrawal) return;
    try {
      const { withdrawalsApi } = await import("@/lib/api/withdrawals");
      const { error } = await withdrawalsApi.delete(selectedWithdrawal.id);
      if (error) {
        alert(`Failed to delete withdrawal: ${error}`);
      } else {
        resetForm();
        deleteModal.closeModal();
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting withdrawal:", error);
      alert("Failed to delete withdrawal. Please try again.");
    }
  };

  const getProjectNames = (projectIds: string[]) => {
    return projectIds
      .map((id) => projects.find((p) => p.id === id)?.projectTitle)
      .filter((name) => name !== undefined)
      .join(", ");
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Withdrawals
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage withdrawals from your projects
            </p>
          </div>
          <Button size="sm" onClick={handleOpenAdd}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Withdrawal
          </Button>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-y border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Amount
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Fee
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Method
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Projects
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Date
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {withdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No withdrawals found. Click "Add Withdrawal" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="py-3">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {formatPrice(withdrawal.amount, withdrawal.currency)}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {withdrawal.withdrawalFee ? formatPrice(withdrawal.withdrawalFee, withdrawal.withdrawalFeeType || withdrawal.currency) : "-"}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {withdrawal.method}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {getProjectNames(withdrawal.projectIds) || "N/A"}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={getStatusColor(withdrawal.status)}>
                        {withdrawal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {withdrawal.requestDate}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(withdrawal)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenDelete(withdrawal)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={addModal.isOpen} onClose={addModal.closeModal} className="max-w-[800px] p-5 lg:p-10 mt-20">
        <form onSubmit={(e) => { e.preventDefault(); handleAddWithdrawal(); }}>
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Add New Withdrawal</h4>
          <WithdrawalForm formData={formData} projects={projects} onInputChange={handleInputChange} onProjectToggle={handleProjectToggle} />
          <div className="mt-6 flex w-full items-center justify-end gap-3">
            <button type="button" onClick={addModal.closeModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">
              Add Withdrawal
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <EditWithdrawalModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        formData={formData}
        onInputChange={handleInputChange}
        projects={projects}
        onProjectToggle={handleProjectToggle}
        onSubmit={handleEditWithdrawal}
        withdrawalId={selectedWithdrawal?.id}
        submitting={submitting}
      />

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} className="max-w-[500px] p-5 lg:p-10">
        <div>
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Delete Withdrawal</h4>
          <p className="mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Are you sure you want to delete the withdrawal of{" "}
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {selectedWithdrawal ? formatPrice(selectedWithdrawal.amount, selectedWithdrawal.currency) : ""}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex w-full items-center justify-end gap-3">
            <button type="button" onClick={deleteModal.closeModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300">
              Cancel
            </button>
            <button type="button" onClick={handleDeleteWithdrawal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Edit Withdrawal Modal Component
function EditWithdrawalModal({
  isOpen,
  onClose,
  formData,
  onInputChange,
  projects,
  onProjectToggle,
  onSubmit,
  withdrawalId,
  submitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: WithdrawalFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  projects: Project[];
  onProjectToggle: (projectId: string) => void;
  onSubmit: () => void;
  withdrawalId?: string;
  submitting: boolean;
}) {
  const [localFormData, setLocalFormData] = useState<WithdrawalFormData>(formData);

  useEffect(() => {
    if (isOpen && formData) {
      setLocalFormData(formData);
    }
  }, [isOpen, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({ ...prev, [name]: value }));
    onInputChange(e);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-[800px] p-5 lg:p-10 mt-20"
    >
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Edit Withdrawal</h4>
        <WithdrawalForm 
          key={withdrawalId || formData.amount}
          formData={localFormData} 
          projects={projects} 
          onInputChange={handleInputChange} 
          onProjectToggle={onProjectToggle} 
        />
        <div className="mt-6 flex w-full items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

