"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import AddExpenseModal from "./components/AddExpenseModal";
import EditExpenseModal from "./components/EditExpenseModal";
import DeleteExpenseModal from "./components/DeleteExpenseModal";
import ExpenseDetailModal from "./components/ExpenseDetailModal";
import ExpensesList from "./components/ExpensesList";
import { Expense, ExpenseFormData } from "./types";
import { expensesApi } from "@/lib/api/expenses";
import { projectsApi } from "@/lib/api/projects";
import { Project } from "@/app/projects/types";

const formatPrice = (price: number, type: string) => {
  const currencySymbols: { [key: string]: string } = {
    inr: "₹",
    dollars: "$",
    euro: "€",
    pkr: "₨",
    gbp: "£",
    cad: "C$",
    aud: "A$",
  };
  const symbol = currencySymbols[type.toLowerCase()] || "$";
  return `${symbol}${price.toLocaleString()}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "success";
    case "Cancelled":
      return "warning";
    case "Completed":
      return "info";
    default:
      return "primary";
  }
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();
  const detailModal = useModal();

  const [formData, setFormData] = useState<ExpenseFormData>({
    name: "",
    amount: "",
    currency: "pkr",
    paymentType: "monthly",
    category: "",
    startDate: "",
    endDate: "",
    status: "Active",
    paymentDate: "",
    notes: "",
    projectIds: [],
  });

  useEffect(() => {
    fetchExpenses();
    fetchProjects();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await expensesApi.getAll();
      if (error) {
        console.error("Error fetching expenses:", error);
        alert("Failed to load expenses. Please try again.");
      } else {
        setExpenses(data || []);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      alert("Failed to load expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await projectsApi.getAll();
      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      currency: "pkr",
      paymentType: "monthly",
      category: "",
      startDate: "",
      endDate: "",
      status: "Active",
      paymentDate: "",
      notes: "",
      projectIds: [],
    });
    setSelectedExpense(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    addModal.openModal();
  };

  const handleOpenEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      name: expense.name,
      amount: expense.amount.toString(),
      currency: expense.currency,
      paymentType: expense.paymentType,
      category: expense.category,
      startDate: expense.startDate,
      endDate: expense.endDate || "",
      status: expense.status,
      paymentDate: expense.paymentDate,
      notes: expense.notes || "",
      projectIds: expense.projectIds || [],
    });
    editModal.openModal();
  };

  const handleOpenDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    deleteModal.openModal();
  };

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    detailModal.openModal();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectSelectionChange = (selectedIds: string[]) => {
    setFormData((prev) => ({ ...prev, projectIds: selectedIds }));
  };

  const handleAddExpense = async () => {
    if (submitting) return;

    if (!formData.name || !formData.amount || !formData.category || !formData.startDate || !formData.paymentDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const { data, error } = await expensesApi.create({
        name: formData.name,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        paymentType: formData.paymentType,
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        status: formData.status,
        paymentDate: formData.paymentDate,
        notes: formData.notes || undefined,
        projectIds: formData.projectIds,
      });

      if (error) {
        alert(`Failed to create expense: ${error}`);
      } else {
        resetForm();
        addModal.closeModal();
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error creating expense:", error);
      alert("Failed to create expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditExpense = async () => {
    if (submitting || !selectedExpense) return;

    if (!formData.name || !formData.amount || !formData.category || !formData.startDate || !formData.paymentDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const { data, error } = await expensesApi.update(selectedExpense.id, {
        name: formData.name,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        paymentType: formData.paymentType,
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        status: formData.status,
        paymentDate: formData.paymentDate,
        notes: formData.notes || undefined,
        projectIds: formData.projectIds,
      });

      if (error) {
        alert(`Failed to update expense: ${error}`);
      } else {
        resetForm();
        editModal.closeModal();
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Failed to update expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      const { error } = await expensesApi.delete(selectedExpense.id);
      if (error) {
        alert(`Failed to delete expense: ${error}`);
      } else {
        resetForm();
        deleteModal.closeModal();
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense. Please try again.");
    }
  };

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Expenses" />
        <div className="mt-6 flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Expenses" />

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Expenses
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Track your business expenses, tools, and platform subscriptions
            </p>
          </div>
          <Button size="sm" onClick={handleOpenAdd}>
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Expense
          </Button>
        </div>

        <ExpensesList
          expenses={expenses}
          projects={projects}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onViewDetails={handleViewDetails}
          formatPrice={formatPrice}
          getStatusColor={getStatusColor}
        />
      </div>

      <AddExpenseModal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        formData={formData}
        onInputChange={handleInputChange}
        projects={projects}
        onProjectSelectionChange={handleProjectSelectionChange}
        onSubmit={handleAddExpense}
      />

      <EditExpenseModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        formData={formData}
        onInputChange={handleInputChange}
        projects={projects}
        onProjectSelectionChange={handleProjectSelectionChange}
        onSubmit={handleEditExpense}
      />

      <DeleteExpenseModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        expense={selectedExpense}
        onConfirm={handleDeleteExpense}
      />

      <ExpenseDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.closeModal}
        expense={selectedExpense}
        projects={projects}
      />
    </div>
  );
}

