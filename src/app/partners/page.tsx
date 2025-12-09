"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import AddPartnerModal from "./components/AddPartnerModal";
import EditPartnerModal from "./components/EditPartnerModal";
import DeletePartnerModal from "./components/DeletePartnerModal";
import PartnersList from "./components/PartnersList";
import PartnerDetailModal from "./components/PartnerDetailModal";
import { partnersApi, Partner } from "@/lib/api/partners";
import { projectsApi } from "@/lib/api/projects";
import { Project } from "@/app/projects/types";
import CircularLoader from "@/components/ui/loader/CircularLoader";

// Exchange rates relative to INR (same as in balance page)
const EXCHANGE_RATES: { [key: string]: number } = {
  inr: 1, // Base currency
  dollars: 0.012, // 1 INR = 0.012 USD
  euro: 0.011, // 1 INR = 0.011 EUR
  pkr: 3.33, // 1 INR = 3.33 PKR
  gbp: 0.0095, // 1 INR = 0.0095 GBP
  cad: 0.016, // 1 INR = 0.016 CAD
  aud: 0.018, // 1 INR = 0.018 AUD
};

// Convert currency function - converts between any two currencies via INR
const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Normalize currency names
  const normalizeCurrency = (curr: string): string => {
    const normalized = curr.toLowerCase();
    if (normalized === "dollars" || normalized === "dollar") return "dollars";
    return normalized;
  };

  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);

  if (from === to) return amount;

  // Convert to INR first (base currency)
  let amountInINR: number;
  if (from === "inr") {
    amountInINR = amount;
  } else {
    // Convert from source currency to INR
    // If 1 INR = X units of currency, then 1 unit = 1/X INR
    const rateToINR = 1 / EXCHANGE_RATES[from];
    amountInINR = amount * rateToINR;
  }

  // Convert from INR to target currency
  if (to === "inr") {
    return amountInINR;
  } else {
    return amountInINR * EXCHANGE_RATES[to];
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
  return `${symbol}${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const addModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();
  const detailModal = useModal();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    status: "Active" as "Active" | "Inactive",
    joinDate: "",
  });

  useEffect(() => {
    fetchData(true); // Show loader on initial load
  }, []);

  const fetchData = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const [partnersResult, projectsResult] = await Promise.all([
        partnersApi.getAll(),
        projectsApi.getAll(),
      ]);

      if (partnersResult.error) {
        console.error("Error fetching partners:", partnersResult.error);
        if (showLoader) {
          alert("Failed to load partners. Please try again.");
        }
      } else {
        const partnersData = partnersResult.data || [];
        
        // Calculate total received for each partner from projects
        // Convert all amounts to PKR before summing
        const partnersWithTotals = partnersData.map((partner) => {
          let totalReceivedInPKR = 0;
          
          if (projectsResult.data) {
            projectsResult.data.forEach((project) => {
              const partnerInProject = project.partners.find(
                (p) => p.partnerId === partner.id || p.name === partner.name
              );
              
              if (partnerInProject && project.finalAmount) {
                // Calculate partner's share in project's currency
                const partnerShare = (project.finalAmount * partnerInProject.sharePercentage) / 100;
                
                // Convert partner's share from project's currency to PKR
                const partnerShareInPKR = convertCurrency(
                  partnerShare,
                  project.priceType,
                  "pkr"
                );
                
                // Add to total (all in PKR)
                totalReceivedInPKR += partnerShareInPKR;
              }
            });
          }
          
          return {
            ...partner,
            totalReceived: totalReceivedInPKR > 0 ? totalReceivedInPKR : undefined,
            totalReceivedCurrency: (totalReceivedInPKR > 0 ? "pkr" : undefined) as "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud" | undefined,
          };
        });
        
        setPartners(partnersWithTotals);
      }

      if (projectsResult.error) {
        console.error("Error fetching projects:", projectsResult.error);
      } else {
        setProjects(projectsResult.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (showLoader) {
        alert("Failed to load data. Please try again.");
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      status: "Active",
      joinDate: "",
    });
    setSelectedPartner(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    addModal.openModal();
  };

  const handleOpenEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData({
      name: partner.name,
      email: partner.email,
      company: partner.company,
      phone: partner.phone,
      status: partner.status,
      joinDate: partner.joinDate,
    });
    editModal.openModal();
  };

  const handleOpenDelete = (partner: Partner) => {
    setSelectedPartner(partner);
    deleteModal.openModal();
  };

  const handleViewDetails = (partner: Partner) => {
    setSelectedPartner(partner);
    detailModal.openModal();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPartner = async () => {
    if (submitting) return;
    
    if (!formData.name || !formData.email || !formData.company || !formData.joinDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const { data, error } = await partnersApi.create({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        status: formData.status,
        joinDate: formData.joinDate,
      });

      if (error) {
        console.error("Partner creation error:", error);
        alert(`Failed to create partner: ${error}`);
      } else if (data) {
        resetForm();
        addModal.closeModal();
        fetchData(false); // Don't show loader on refresh after action
      } else {
        console.error("Partner creation returned no data and no error");
        alert("Failed to create partner. Please try again.");
      }
    } catch (error) {
      console.error("Error creating partner:", error);
      alert("Failed to create partner. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPartner = async () => {
    if (submitting || !selectedPartner) return;
    
    if (!formData.name || !formData.email || !formData.company || !formData.joinDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const { data, error } = await partnersApi.update(selectedPartner.id, {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        status: formData.status,
        joinDate: formData.joinDate,
      });

      if (error) {
        alert(`Failed to update partner: ${error}`);
      } else {
        resetForm();
        editModal.closeModal();
        detailModal.closeModal(); // Close detail modal if open
        fetchData(false); // Don't show loader on refresh after action
      }
    } catch (error) {
      console.error("Error updating partner:", error);
      alert("Failed to update partner. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePartner = async () => {
    if (!selectedPartner) return;

    try {
      const { error } = await partnersApi.delete(selectedPartner.id);
      if (error) {
        alert(`Failed to delete partner: ${error}`);
      } else {
        resetForm();
        deleteModal.closeModal();
        detailModal.closeModal(); // Close detail modal if open
        fetchData(false); // Don't show loader on refresh after action
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
      alert("Failed to delete partner. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active" ? "success" : "warning";
  };

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Partners" />
        <div className="mt-6 flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <CircularLoader text="Loading partners..." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Partners" />
      
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Partners
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your partners and collaborations
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
            Add Partner
          </Button>
        </div>

        <PartnersList
          partners={partners}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onViewDetails={handleViewDetails}
          getStatusColor={getStatusColor}
          formatPrice={formatPrice}
        />
      </div>

      {/* Add Partner Modal */}
      <AddPartnerModal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleAddPartner}
        submitting={submitting}
      />

      {/* Edit Partner Modal */}
      <EditPartnerModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleEditPartner}
        submitting={submitting}
      />

      {/* Delete Partner Modal */}
      <DeletePartnerModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        partner={selectedPartner}
        onConfirm={handleDeletePartner}
      />

      {/* Partner Detail Modal */}
      <PartnerDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.closeModal}
        partner={selectedPartner}
        projects={projects}
        onEdit={() => {
          if (selectedPartner) {
            handleOpenEdit(selectedPartner);
            detailModal.closeModal();
          }
        }}
        onDelete={() => {
          if (selectedPartner) {
            handleOpenDelete(selectedPartner);
            detailModal.closeModal();
          }
        }}
        formatPrice={formatPrice}
      />
    </div>
  );
}
