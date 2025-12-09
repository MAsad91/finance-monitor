"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Expense } from "../types";
import { Project } from "@/app/projects/types";

type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

interface ExpensesListProps {
  expenses: Expense[];
  projects: Project[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onViewDetails: (expense: Expense) => void;
  formatPrice: (price: number, type: string) => string;
  getStatusColor: (status: string) => BadgeColor;
}

export default function ExpensesList({
  expenses,
  projects,
  onEdit,
  onDelete,
  onViewDetails,
  formatPrice,
  getStatusColor,
}: ExpensesListProps) {
  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-y border-gray-100 dark:border-gray-800">
          <TableRow>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Name
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Category
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Amount
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Payment Type
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Payment Date
            </TableCell>
          <TableCell
            isHeader
            className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Projects
          </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Status
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                No expenses found. Click "Add Expense" to create one.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="py-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {expense.name}
                  </p>
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                  {expense.category}
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {formatPrice(expense.amount, expense.currency)}
                  </p>
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                  {expense.paymentType.charAt(0).toUpperCase() + expense.paymentType.slice(1)}
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                  {expense.paymentDate}
                </TableCell>
                <TableCell className="py-3">
                  <ProjectsCell expense={expense} projects={projects} />
                </TableCell>
                <TableCell className="py-3">
                  <Badge size="sm" color={getStatusColor(expense.status)}>
                    {expense.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(expense)}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                      title="View Details"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(expense)}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                      title="Edit"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(expense)}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
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
  );
}

// Projects Cell Component
function ProjectsCell({
  expense,
  projects,
}: {
  expense: Expense;
  projects: Project[];
}) {
  const expenseProjects = projects.filter((project) =>
    expense.projectIds?.includes(project.id)
  );
  const maxVisible = 2;
  const hasMoreProjects = expenseProjects.length > maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {expenseProjects.length > 0 ? (
        <>
          {expenseProjects.slice(0, maxVisible).map((project) => (
            <Badge key={project.id} size="sm" color="primary">
              {project.projectTitle}
            </Badge>
          ))}
          {hasMoreProjects && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
              title={`View all ${expenseProjects.length} projects`}
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              +{expenseProjects.length - maxVisible}
            </span>
          )}
        </>
      ) : (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          No projects
        </span>
      )}
    </div>
  );
}

