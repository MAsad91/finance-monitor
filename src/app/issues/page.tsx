"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useModal } from "@/hooks/useModal";

// Issue interface
interface Issue {
  id: string;
  title: string;
  description: string;
  type: "Dispute" | "Bug" | "Feature Request" | "Other";
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  reportedBy: string;
  reportedDate: string;
  resolvedDate?: string;
  createdAt: string;
}

// Mock data
const initialIssues: Issue[] = [
  {
    id: "1",
    title: "Payment processing error",
    description: "Users unable to complete payment transactions",
    type: "Bug",
    priority: "High",
    status: "Open",
    reportedBy: "John Doe",
    reportedDate: "2024-01-15",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Dispute over project delivery",
    description: "Client claims project was not delivered as agreed",
    type: "Dispute",
    priority: "Critical",
    status: "In Progress",
    reportedBy: "Jane Smith",
    reportedDate: "2024-01-10",
    createdAt: "2024-01-10",
  },
];

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  const addModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Bug" as "Dispute" | "Bug" | "Feature Request" | "Other",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    status: "Open" as "Open" | "In Progress" | "Resolved" | "Closed",
    reportedBy: "",
    reportedDate: "",
    resolvedDate: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "Bug",
      priority: "Medium",
      status: "Open",
      reportedBy: "",
      reportedDate: "",
      resolvedDate: "",
    });
    setSelectedIssue(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    addModal.openModal();
  };

  const handleOpenEdit = (issue: Issue) => {
    setSelectedIssue(issue);
    setFormData({
      title: issue.title,
      description: issue.description,
      type: issue.type,
      priority: issue.priority,
      status: issue.status,
      reportedBy: issue.reportedBy,
      reportedDate: issue.reportedDate,
      resolvedDate: issue.resolvedDate || "",
    });
    editModal.openModal();
  };

  const handleOpenDelete = (issue: Issue) => {
    setSelectedIssue(issue);
    deleteModal.openModal();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddIssue = () => {
    if (!formData.title || !formData.description || !formData.reportedBy || !formData.reportedDate) {
      alert("Please fill in all required fields");
      return;
    }

    const newIssue: Issue = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      status: formData.status,
      reportedBy: formData.reportedBy,
      reportedDate: formData.reportedDate,
      resolvedDate: formData.resolvedDate || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setIssues([...issues, newIssue]);
    resetForm();
    addModal.closeModal();
  };

  const handleEditIssue = () => {
    if (!selectedIssue || !formData.title || !formData.description || !formData.reportedBy || !formData.reportedDate) {
      alert("Please fill in all required fields");
      return;
    }

    setIssues(
      issues.map((issue) =>
        issue.id === selectedIssue.id
          ? {
              ...issue,
              title: formData.title,
              description: formData.description,
              type: formData.type,
              priority: formData.priority,
              status: formData.status,
              reportedBy: formData.reportedBy,
              reportedDate: formData.reportedDate,
              resolvedDate: formData.resolvedDate || undefined,
            }
          : issue
      )
    );

    resetForm();
    editModal.closeModal();
  };

  const handleDeleteIssue = () => {
    if (!selectedIssue) return;
    setIssues(issues.filter((issue) => issue.id !== selectedIssue.id));
    resetForm();
    deleteModal.closeModal();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
      case "Closed":
        return "success";
      case "In Progress":
        return "info";
      case "Open":
        return "warning";
      default:
        return "primary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "error";
      case "High":
        return "warning";
      case "Medium":
        return "info";
      case "Low":
        return "primary";
      default:
        return "primary";
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Issues/Disputes" />
      
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Issues & Disputes
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and resolve issues and disputes
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
            Add Issue
          </Button>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-y border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Title
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Type
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Priority
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
                  Reported By
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Reported Date
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
              {issues.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No issues found. Click "Add Issue" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="py-3">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {issue.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {issue.description}
                      </p>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color="primary">
                        {issue.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {issue.reportedBy}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {issue.reportedDate}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(issue)}
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
                          onClick={() => handleOpenDelete(issue)}
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
      </div>

      {/* Add Issue Modal */}
      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        className="max-w-[584px] p-5 lg:p-10"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddIssue();
          }}
        >
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Add New Issue
          </h4>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="col-span-1 sm:col-span-2">
              <Label>
                Title <span className="text-error-500">*</span>
              </Label>
              <input
                type="text"
                name="title"
                placeholder="Enter issue title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label>
                Description <span className="text-error-500">*</span>
              </Label>
              <textarea
                name="description"
                placeholder="Enter issue description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="h-32 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="col-span-1">
              <Label>
                Type <span className="text-error-500">*</span>
              </Label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="Bug">Bug</option>
                <option value="Dispute">Dispute</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-1">
              <Label>
                Priority <span className="text-error-500">*</span>
              </Label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="col-span-1">
              <Label>
                Status <span className="text-error-500">*</span>
              </Label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="col-span-1">
              <Label>
                Reported By <span className="text-error-500">*</span>
              </Label>
              <input
                type="text"
                name="reportedBy"
                placeholder="Reporter name"
                value={formData.reportedBy}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="col-span-1">
              <Label>
                Reported Date <span className="text-error-500">*</span>
              </Label>
              <input
                type="date"
                name="reportedDate"
                value={formData.reportedDate}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label>Resolved Date</Label>
              <input
                type="date"
                name="resolvedDate"
                value={formData.resolvedDate}
                onChange={handleInputChange}
                min={formData.reportedDate}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>

          <div className="mt-6 flex w-full items-center justify-end gap-3">
            <Button size="sm" variant="outline" type="button" onClick={addModal.closeModal}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Add Issue
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Issue Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        className="max-w-[584px] p-5 lg:p-10"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEditIssue();
          }}
        >
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Edit Issue
          </h4>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="col-span-1 sm:col-span-2">
              <Label>
                Title <span className="text-error-500">*</span>
              </Label>
              <input
                type="text"
                name="title"
                placeholder="Enter issue title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label>
                Description <span className="text-error-500">*</span>
              </Label>
              <textarea
                name="description"
                placeholder="Enter issue description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="h-32 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="col-span-1">
              <Label>
                Type <span className="text-error-500">*</span>
              </Label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="Bug">Bug</option>
                <option value="Dispute">Dispute</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-1">
              <Label>
                Priority <span className="text-error-500">*</span>
              </Label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="col-span-1">
              <Label>
                Status <span className="text-error-500">*</span>
              </Label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="col-span-1">
              <Label>
                Reported By <span className="text-error-500">*</span>
              </Label>
              <input
                type="text"
                name="reportedBy"
                placeholder="Reporter name"
                value={formData.reportedBy}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="col-span-1">
              <Label>
                Reported Date <span className="text-error-500">*</span>
              </Label>
              <input
                type="date"
                name="reportedDate"
                value={formData.reportedDate}
                onChange={handleInputChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label>Resolved Date</Label>
              <input
                type="date"
                name="resolvedDate"
                value={formData.resolvedDate}
                onChange={handleInputChange}
                min={formData.reportedDate}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>

          <div className="mt-6 flex w-full items-center justify-end gap-3">
            <Button size="sm" variant="outline" type="button" onClick={editModal.closeModal}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Issue Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        className="max-w-[500px] p-5 lg:p-10"
      >
        <div>
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete Issue
          </h4>
          <p className="mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Are you sure you want to delete the issue{" "}
            <span className="font-semibold text-gray-800 dark:text-white/90">
              "{selectedIssue?.title}"
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex w-full items-center justify-end gap-3">
            <Button size="sm" variant="outline" onClick={deleteModal.closeModal}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteIssue}
              className="!bg-error-500 !text-white hover:!bg-error-600"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
