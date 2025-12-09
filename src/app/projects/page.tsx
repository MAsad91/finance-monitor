"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import AddProjectModal from "./components/AddProjectModal";
import EditProjectModal from "./components/EditProjectModal";
import DeleteProjectModal from "./components/DeleteProjectModal";
import PartnerModal from "./components/PartnerModal";
import ProjectDetailModal from "./components/ProjectDetailModal";
import PartnersViewModal from "./components/PartnersViewModal";
import ProjectsList from "./components/ProjectsList";
import PlatformSettingsModal from "./components/PlatformSettingsModal";
import { Project, ProjectPartner } from "./types";
import { ProjectFormData } from "./components/ProjectForm";
import { projectsApi } from "@/lib/api/projects";
import { partnersApi } from "@/lib/api/partners";
import { platformSettingsApi, PlatformSettings } from "@/lib/api/platformSettings";
import { BadgeColor } from "@/components/ui/badge/Badge";
import CircularLoader from "@/components/ui/loader/CircularLoader";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings[]>([]);
  
  const addModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();
  const partnerModal = useModal();
  const partnersViewModal = useModal();
  const detailModal = useModal();
  const platformSettingsModal = useModal();

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

  const [partnerFormData, setPartnerFormData] = useState({
    partnerId: "",
    sharePercentage: "",
  });

  const [editingPartnerIndex, setEditingPartnerIndex] = useState<number | null>(null);

  // Fetch projects and platform settings on mount
  useEffect(() => {
    fetchProjects(true); // Show loader on initial load
    fetchPlatformSettings();
  }, []);

  const fetchPlatformSettings = async () => {
    try {
      const { data, error } = await platformSettingsApi.getAll();
      if (error) {
        console.error("Error fetching platform settings:", error);
        setPlatformSettings([]); // Ensure it's always an array
      } else {
        // Ensure data is an array
        const settings = Array.isArray(data) ? data : [];
        setPlatformSettings(settings);
      }
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      setPlatformSettings([]); // Ensure it's always an array on error
    }
  };

  const fetchProjects = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const { data, error } = await projectsApi.getAll();
      if (error) {
        console.error("Error fetching projects:", error);
        if (showLoader) {
          alert("Failed to load projects. Please try again.");
        }
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      if (showLoader) {
        alert("Failed to load projects. Please try again.");
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
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
    setSelectedProject(null);
  };

  const handlePlatformChange = (platformName: string, feePercentage: number, withdrawalFees?: PlatformSettings['withdrawalFees']) => {
    const currencyType = (val: string | undefined): "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud" => {
      const validCurrencies: ("inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud")[] = ["inr", "dollars", "euro", "pkr", "gbp", "cad", "aud"];
      return (val && validCurrencies.includes(val as any)) ? val as any : "dollars";
    };

    setFormData((prev) => ({
      ...prev,
      platformName,
      platformFeePercentage: feePercentage.toString(),
      isCustomPlatform: platformName === "",
      withdrawalFees: withdrawalFees ? {
        platformToPayoneer: {
          amount: withdrawalFees.platformToPayoneer?.amount?.toString() || "",
          currency: currencyType(withdrawalFees.platformToPayoneer?.currency),
        },
        platformToLocalBank: {
          amount: withdrawalFees.platformToLocalBank?.amount?.toString() || "",
          currency: currencyType(withdrawalFees.platformToLocalBank?.currency),
        },
        payoneerToLocalBank: {
          amount: withdrawalFees.payoneerToLocalBank?.amount?.toString() || "",
          currency: currencyType(withdrawalFees.payoneerToLocalBank?.currency),
        },
      } : prev.withdrawalFees,
    }));
  };

  const resetPartnerForm = () => {
    setPartnerFormData({
      partnerId: "",
      sharePercentage: "",
    });
    setEditingPartnerIndex(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    addModal.openModal();
  };

  const handleOpenEdit = (project: Project) => {
    setSelectedProject(project);
    // Check if platform is in settings or is custom
    const isInSettings = platformSettings.some(
      (p) => p.platformName.toLowerCase() === project.platformName.toLowerCase()
    );
    const platform = platformSettings.find(
      (p) => p.platformName.toLowerCase() === project.platformName.toLowerCase()
    );
    
    const currencyType = (val: string | undefined): "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud" => {
      const validCurrencies: ("inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud")[] = ["inr", "dollars", "euro", "pkr", "gbp", "cad", "aud"];
      return (val && validCurrencies.includes(val as any)) ? val as any : "dollars";
    };

    setFormData({
      projectTitle: project.projectTitle,
      projectPrice: project.projectPrice.toString(),
      priceType: project.priceType,
      platformFeePercentage: project.platformFeePercentage.toString(),
      platformName: project.platformName,
      projectStartDate: project.projectStartDate,
      projectEndDate: project.projectEndDate || "",
      status: project.status,
      includeCharity: project.includeCharity || false,
      isCustomPlatform: !isInSettings,
      withdrawalFees: platform?.withdrawalFees ? {
        platformToPayoneer: {
          amount: platform.withdrawalFees.platformToPayoneer?.amount?.toString() || "",
          currency: currencyType(platform.withdrawalFees.platformToPayoneer?.currency),
        },
        platformToLocalBank: {
          amount: platform.withdrawalFees.platformToLocalBank?.amount?.toString() || "",
          currency: currencyType(platform.withdrawalFees.platformToLocalBank?.currency),
        },
        payoneerToLocalBank: {
          amount: platform.withdrawalFees.payoneerToLocalBank?.amount?.toString() || "",
          currency: currencyType(platform.withdrawalFees.payoneerToLocalBank?.currency),
        },
      } : {
        platformToPayoneer: { amount: "", currency: "dollars" },
        platformToLocalBank: { amount: "", currency: "dollars" },
        payoneerToLocalBank: { amount: "", currency: "dollars" },
      },
    });
    editModal.openModal();
  };

  const handleOpenDelete = (project: Project) => {
    setSelectedProject(project);
    deleteModal.openModal();
  };

  const handleOpenPartnerModal = (project: Project) => {
    setSelectedProject(project);
    resetPartnerForm();
    partnerModal.openModal();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // Handle nested withdrawal fees fields
      if (name.startsWith("withdrawalFees.")) {
        const parts = name.split(".");
        if (parts.length === 3) {
          const [_, feeType, field] = parts;
          const currencyType = (val: string): "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud" => {
            const validCurrencies: ("inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud")[] = ["inr", "dollars", "euro", "pkr", "gbp", "cad", "aud"];
            return (val && validCurrencies.includes(val as any)) ? val as any : "dollars";
          };
          
          setFormData((prev) => ({
            ...prev,
            withdrawalFees: {
              ...prev.withdrawalFees,
              [feeType]: {
                ...prev.withdrawalFees[feeType as keyof typeof prev.withdrawalFees],
                [field]: field === "currency" ? currencyType(value) : value,
              },
            },
          }));
          return;
        }
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProject = async () => {
    if (submitting) return; // Prevent double submission
    
    // Validation - platformFeePercentage is only required when not "Other"
    const platformFeeRequired = !formData.isCustomPlatform;
    
    if (!formData.projectTitle || !formData.projectPrice || !formData.platformName || !formData.projectStartDate) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (platformFeeRequired && !formData.platformFeePercentage) {
      alert("Please fill in platform fee percentage");
      return;
    }

    try {
      setSubmitting(true);
      const projectData = {
        projectTitle: formData.projectTitle,
        projectPrice: parseFloat(formData.projectPrice),
        priceType: formData.priceType,
        platformFeePercentage: formData.platformFeePercentage ? parseFloat(formData.platformFeePercentage) : 0,
        platformName: formData.platformName,
        projectStartDate: formData.projectStartDate,
        projectEndDate: formData.projectEndDate || undefined,
        status: formData.status,
        includeCharity: !!formData.includeCharity, // Ensure it's a boolean
        partners: [],
      };

      const { data, error } = await projectsApi.create(projectData);
      if (error) {
        alert(`Failed to create project: ${error}`);
      } else {
        resetForm();
        addModal.closeModal();
        fetchProjects(false); // Don't show loader on refresh after action
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = async () => {
    if (!selectedProject) return;
    
    // Validation - platformFeePercentage is only required when not "Other"
    const platformFeeRequired = !formData.isCustomPlatform;
    
    if (!formData.projectTitle || !formData.projectPrice || !formData.platformName || !formData.projectStartDate) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (platformFeeRequired && !formData.platformFeePercentage) {
      alert("Please fill in platform fee percentage");
      return;
    }

    try {
      const projectData = {
        projectTitle: formData.projectTitle,
        projectPrice: parseFloat(formData.projectPrice),
        priceType: formData.priceType,
        platformFeePercentage: formData.platformFeePercentage ? parseFloat(formData.platformFeePercentage) : 0,
        platformName: formData.platformName,
        projectStartDate: formData.projectStartDate,
        projectEndDate: formData.projectEndDate || undefined,
        status: formData.status,
        includeCharity: Boolean(formData.includeCharity), // Explicitly convert to boolean
      };
      
      console.log("Updating project with charity:", projectData.includeCharity, "formData.includeCharity:", formData.includeCharity); // Debug log

      const { data, error } = await projectsApi.update(selectedProject.id, projectData);
      if (error) {
        alert(`Failed to update project: ${error}`);
      } else {
        resetForm();
        editModal.closeModal();
        fetchProjects(false); // Don't show loader on refresh after action
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      const { error } = await projectsApi.delete(selectedProject.id);
      if (error) {
        alert(`Failed to delete project: ${error}`);
      } else {
        resetForm();
        deleteModal.closeModal();
        fetchProjects(false); // Don't show loader on refresh after action
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const handleAddPartner = async () => {
    if (!selectedProject || !partnerFormData.partnerId) {
      alert("Please select a partner");
      return;
    }

    // Handle "Select All Partners" option
    if (partnerFormData.partnerId === "__select_all__") {
      try {
        // Fetch all active partners
        const { data: allPartners, error: partnersError } = await partnersApi.getAll();
        if (partnersError || !allPartners) {
          alert("Failed to fetch partners");
          return;
        }

        const activePartners = allPartners.filter((p) => p.status === "Active");
        if (activePartners.length === 0) {
          alert("No active partners available");
          return;
        }

        // Get existing partner IDs to avoid duplicates
        const existingPartnerIds = new Set(selectedProject.partners.map((p) => p.partnerId).filter(Boolean));
        
        // Filter out partners that are already in the project
        const newPartnersToAdd = activePartners.filter((p) => !existingPartnerIds.has(p.id));
        
        if (newPartnersToAdd.length === 0) {
          alert("All active partners are already added to this project");
          return;
        }

        // Calculate remaining share percentage
        const currentTotalShare = selectedProject.partners.reduce((sum, p) => sum + p.sharePercentage, 0);
        const remainingShare = 100 - currentTotalShare;
        
        if (remainingShare <= 0) {
          alert("No remaining share percentage available. Current total: 100%");
          return;
        }

        // Distribute remaining share equally among new partners
        const sharePerPartner = remainingShare / newPartnersToAdd.length;

        // Create new partner entries
        const newPartnerEntries: ProjectPartner[] = newPartnersToAdd.map((partner, index) => ({
          id: `${Date.now()}-${index}`,
          partnerId: partner.id,
          name: partner.name,
          sharePercentage: sharePerPartner,
        }));

        // Combine with existing partners
        const updatedPartners = [...selectedProject.partners, ...newPartnerEntries];

        const { data, error } = await projectsApi.update(selectedProject.id, {
          partners: updatedPartners,
        });

        if (error) {
          alert(`Failed to add partners: ${error}`);
        } else {
          resetPartnerForm();
          partnerModal.closeModal();
          fetchProjects(false); // Don't show loader on refresh after action
        }
      } catch (error) {
        console.error("Error adding all partners:", error);
        alert("Failed to add partners. Please try again.");
      }
      return;
    }

    // Handle single partner selection (existing logic)
    if (!partnerFormData.sharePercentage) {
      alert("Please enter share percentage");
      return;
    }

    const sharePercentage = parseFloat(partnerFormData.sharePercentage);
    if (sharePercentage <= 0 || sharePercentage > 100) {
      alert("Share percentage must be between 0 and 100");
      return;
    }

    const currentTotalShare = selectedProject.partners.reduce((sum, p) => sum + p.sharePercentage, 0);
    if (currentTotalShare + sharePercentage > 100) {
      alert(`Total share percentage cannot exceed 100%. Current total: ${currentTotalShare}%`);
      return;
    }

    try {
      // Fetch partner details to get name
      const { data: partnerData } = await partnersApi.getById(partnerFormData.partnerId);
      if (!partnerData) {
        alert("Partner not found");
        return;
      }

      let updatedPartners: ProjectPartner[];
      
      if (editingPartnerIndex !== null) {
        updatedPartners = [...selectedProject.partners];
        updatedPartners[editingPartnerIndex] = {
          id: updatedPartners[editingPartnerIndex].id,
          partnerId: partnerFormData.partnerId,
          name: partnerData.name,
          sharePercentage: sharePercentage,
        };
      } else {
        const newPartner: ProjectPartner = {
          id: Date.now().toString(),
          partnerId: partnerFormData.partnerId,
          name: partnerData.name,
          sharePercentage: sharePercentage,
        };
        updatedPartners = [...selectedProject.partners, newPartner];
      }

      const { data, error } = await projectsApi.update(selectedProject.id, {
        partners: updatedPartners,
      });

      if (error) {
        alert(`Failed to update partners: ${error}`);
      } else {
        resetPartnerForm();
        partnerModal.closeModal();
        fetchProjects(false); // Don't show loader on refresh after action
      }
    } catch (error) {
      console.error("Error updating partners:", error);
      alert("Failed to update partners. Please try again.");
    }
  };

  const handleEditPartner = (project: Project, partnerIndex: number) => {
    setSelectedProject(project);
    const partner = project.partners[partnerIndex];
    setPartnerFormData({
      partnerId: partner.partnerId || "",
      sharePercentage: partner.sharePercentage.toString(),
    });
    setEditingPartnerIndex(partnerIndex);
    partnerModal.openModal();
  };

  const handleDeletePartner = async (project: Project, partnerIndex: number | number[]) => {
    try {
      const indicesToDelete = Array.isArray(partnerIndex) ? partnerIndex : [partnerIndex];
      const updatedPartners = project.partners.filter(
        (_, index) => !indicesToDelete.includes(index)
      );
      
      const { error } = await projectsApi.update(project.id, {
        partners: updatedPartners,
      });

      if (error) {
        alert(`Failed to delete partner(s): ${error}`);
      } else {
        fetchProjects(false); // Don't show loader on refresh after action
        // Close the modal if it's open
        if (partnersViewModal.isOpen) {
          partnersViewModal.closeModal();
        }
      }
    } catch (error) {
      console.error("Error deleting partner(s):", error);
      alert("Failed to delete partner(s). Please try again.");
    }
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    detailModal.openModal();
  };

  const handleViewPartners = (project: Project) => {
    setSelectedProject(project);
    partnersViewModal.openModal();
  };

  const getStatusColor = (status: string): BadgeColor => {
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

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Projects" />
        <div className="mt-6 flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <CircularLoader text="Loading projects..." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Projects" />
      
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Projects
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your projects and track their progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={platformSettingsModal.openModal}
              title="Platform Settings"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </Button>
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
              Add Project
            </Button>
          </div>
        </div>

        <ProjectsList
          projects={projects}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onViewDetails={handleViewDetails}
          onAddPartner={handleOpenPartnerModal}
          onEditPartner={handleEditPartner}
          onDeletePartner={handleDeletePartner}
          onViewPartners={handleViewPartners}
          formatPrice={formatPrice}
          getStatusColor={getStatusColor}
        />
      </div>

      <AddProjectModal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleAddProject}
        platformSettings={platformSettings}
        onPlatformChange={handlePlatformChange}
      />

      <EditProjectModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleEditProject}
        platformSettings={platformSettings}
        onPlatformChange={handlePlatformChange}
        projectId={selectedProject?.id}
      />

      <DeleteProjectModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        project={selectedProject}
        onConfirm={handleDeleteProject}
      />

      <PartnerModal
        isOpen={partnerModal.isOpen}
        onClose={() => {
          partnerModal.closeModal();
          resetPartnerForm();
        }}
        project={selectedProject}
        selectedPartnerId={partnerFormData.partnerId}
        sharePercentage={partnerFormData.sharePercentage}
        onPartnerChange={(partnerId) => setPartnerFormData((prev) => ({ ...prev, partnerId }))}
        onSharePercentageChange={(value) => setPartnerFormData((prev) => ({ ...prev, sharePercentage: value }))}
        onSubmit={handleAddPartner}
        isEditing={editingPartnerIndex !== null}
        includeCharity={selectedProject?.includeCharity || false}
        onCharityChange={async (includeCharity) => {
          if (selectedProject) {
            try {
              const { error } = await projectsApi.update(selectedProject.id, {
                includeCharity,
              });
              if (error) {
                alert(`Failed to update charity setting: ${error}`);
              } else {
                fetchProjects(false); // Don't show loader on refresh after action
              }
            } catch (error) {
              console.error("Error updating charity setting:", error);
              alert("Failed to update charity setting. Please try again.");
            }
          }
        }}
      />

      <ProjectDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.closeModal}
        project={selectedProject}
      />

      <PartnersViewModal
        isOpen={partnersViewModal.isOpen}
        onClose={partnersViewModal.closeModal}
        project={selectedProject}
        onAddPartner={() => {
          if (selectedProject) {
            handleOpenPartnerModal(selectedProject);
          }
        }}
        onEditPartner={(partnerIndex) => {
          if (selectedProject) {
            handleEditPartner(selectedProject, partnerIndex);
          }
        }}
        onDeletePartner={async (partnerIndex) => {
          if (selectedProject) {
            await handleDeletePartner(selectedProject, partnerIndex);
            // Keep modal open after delete to show updated list
            fetchProjects(false); // Don't show loader on refresh after action
          }
        }}
      />

      <PlatformSettingsModal
        isOpen={platformSettingsModal.isOpen}
        onClose={platformSettingsModal.closeModal}
        onSettingsUpdated={() => {
          fetchPlatformSettings(); // Refresh platform settings when updated
        }}
      />
    </div>
  );
}
