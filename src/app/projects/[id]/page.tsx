"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Project } from "../types";
import { projectsApi } from "@/lib/api/projects";
import { useModal } from "@/hooks/useModal";
import EditProjectModal from "../components/EditProjectModal";
import DeleteProjectModal from "../components/DeleteProjectModal";
import { ProjectFormData } from "../components/ProjectForm";
import CircularLoader from "@/components/ui/loader/CircularLoader";

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
    case "Completed":
      return "success";
    case "in progress":
      return "info";
    case "Active":
      return "success";
    case "Inactive":
      return "warning";
    default:
      return "primary";
  }
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ProjectFormData>({
    projectTitle: "",
    projectPrice: "",
    priceType: "pkr",
    platformFeePercentage: "",
    platformName: "",
    projectStartDate: "",
    projectEndDate: "",
    status: "Active",
    includeCharity: false,
    isCustomPlatform: false,
    withdrawalFees: {
      platformToPayoneer: { amount: "", currency: "dollars" },
      platformToLocalBank: { amount: "", currency: "dollars" },
      payoneerToLocalBank: { amount: "", currency: "dollars" },
    },
  });

  const editModal = useModal();
  const deleteModal = useModal();

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const { data, error } = await projectsApi.getById(projectId);
      if (error) {
        console.error("Error fetching project:", error);
        alert("Failed to load project. Please try again.");
      } else if (data) {
        setProject(data);
        setFormData({
          projectTitle: data.projectTitle,
          projectPrice: data.projectPrice.toString(),
          priceType: data.priceType,
          platformFeePercentage: data.platformFeePercentage.toString(),
          platformName: data.platformName,
          projectStartDate: data.projectStartDate,
          projectEndDate: data.projectEndDate || "",
          status: data.status,
          includeCharity: data.includeCharity || false,
          isCustomPlatform: false,
          withdrawalFees: {
            platformToPayoneer: { amount: "", currency: "dollars" },
            platformToLocalBank: { amount: "", currency: "dollars" },
            payoneerToLocalBank: { amount: "", currency: "dollars" },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      alert("Failed to load project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenEdit = () => {
    if (project) {
      editModal.openModal();
    }
  };

  const handleOpenDelete = () => {
    deleteModal.openModal();
  };

  const handleEditProject = async () => {
    if (!project || !formData.projectTitle || !formData.projectPrice || !formData.platformFeePercentage || !formData.platformName || !formData.projectStartDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const projectData = {
        projectTitle: formData.projectTitle,
        projectPrice: parseFloat(formData.projectPrice),
        priceType: formData.priceType,
        platformFeePercentage: parseFloat(formData.platformFeePercentage),
        platformName: formData.platformName,
        projectStartDate: formData.projectStartDate,
        projectEndDate: formData.projectEndDate || undefined,
        status: formData.status,
        includeCharity: formData.includeCharity,
      };

      const { data, error } = await projectsApi.update(project.id, projectData);
      if (error) {
        alert(`Failed to update project: ${error}`);
      } else {
        editModal.closeModal();
        fetchProject(); // Refresh the project data
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    try {
      const { error } = await projectsApi.delete(project.id);
      if (error) {
        alert(`Failed to delete project: ${error}`);
      } else {
        deleteModal.closeModal();
        router.push("/projects");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Loading..." />
        <div className="mt-6 flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <CircularLoader text="Loading project..." />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Project Not Found" />
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Project not found.
          </p>
          <div className="mt-4 flex justify-center">
            <Button size="sm" variant="outline" onClick={() => router.push("/projects")}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={project.projectTitle} />
      
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-6 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        {/* Header with Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              {project.projectTitle}
            </h3>
            <div className="mt-2">
              <Badge size="sm" color={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleOpenEdit}>
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenDelete}
              className="!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push("/projects")}>
              Back to Projects
            </Button>
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Financial Information */}
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Financial Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Project Price
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {formatPrice(project.projectPrice, project.priceType)}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Platform Fee
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {project.platformFeePercentage}% ({formatPrice(project.platformFeeAmount || 0, project.priceType)})
                </p>
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Project Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Platform Name
                </label>
                <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                  {project.platformName}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Price Type
                </label>
                <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                  {project.priceType.toUpperCase()}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Project Start Date
                </label>
                <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                  {project.projectStartDate}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Project End Date
                </label>
                <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                  {project.projectEndDate || "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* Calculated Amounts */}
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Calculated Amounts
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Total Amount
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {formatPrice(project.totalAmount || project.projectPrice, project.priceType)}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  After Platform Fee
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {formatPrice(project.afterPlatformFee || project.projectPrice, project.priceType)}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Final Amount
                </label>
                <p className="mt-1 text-xl font-bold text-brand-600 dark:text-brand-400">
                  {formatPrice(project.finalAmount || project.projectPrice, project.priceType)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Partners Section */}
        {project.partners && project.partners.length > 0 && (
          <div className="mt-8">
            <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Partners
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {project.partners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {partner.name}
                  </span>
                  <Badge size="sm" color="info">
                    {partner.sharePercentage}%
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Total Share:{" "}
              <span className="font-semibold">
                {project.partners.reduce((sum, p) => sum + p.sharePercentage, 0)}%
              </span>
            </div>
          </div>
        )}
      </div>

      <EditProjectModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleEditProject}
      />

      <DeleteProjectModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        project={project}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
}
