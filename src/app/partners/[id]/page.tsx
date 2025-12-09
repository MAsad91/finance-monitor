"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Partner } from "@/lib/api/partners";
import { partnersApi } from "@/lib/api/partners";
import { useModal } from "@/hooks/useModal";
import EditPartnerModal from "../components/EditPartnerModal";
import DeletePartnerModal from "../components/DeletePartnerModal";
import CircularLoader from "@/components/ui/loader/CircularLoader";

const getStatusColor = (status: string) => {
  return status === "Active" ? "success" : "warning";
};

export default function PartnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    status: "Active" as "Active" | "Inactive",
    joinDate: "",
  });

  const editModal = useModal();
  const deleteModal = useModal();

  useEffect(() => {
    if (partnerId) {
      fetchPartner();
    }
  }, [partnerId]);

  const fetchPartner = async () => {
    try {
      setLoading(true);
      const { data, error } = await partnersApi.getById(partnerId);
      if (error) {
        console.error("Error fetching partner:", error);
        alert("Failed to load partner. Please try again.");
        router.push("/partners");
      } else if (data) {
        setPartner(data);
        setFormData({
          name: data.name,
          email: data.email,
          company: data.company,
          phone: data.phone,
          status: data.status,
          joinDate: data.joinDate,
        });
      }
    } catch (error) {
      console.error("Error fetching partner:", error);
      alert("Failed to load partner. Please try again.");
      router.push("/partners");
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
    editModal.openModal();
  };

  const handleOpenDelete = () => {
    deleteModal.openModal();
  };

  const handleEditPartner = async () => {
    if (!partner || !formData.name || !formData.email || !formData.company || !formData.joinDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const { data, error } = await partnersApi.update(partner.id, {
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
        editModal.closeModal();
        fetchPartner(); // Refresh the data
      }
    } catch (error) {
      console.error("Error updating partner:", error);
      alert("Failed to update partner. Please try again.");
    }
  };

  const handleDeletePartner = async () => {
    if (!partner) return;

    try {
      const { error } = await partnersApi.delete(partner.id);
      if (error) {
        alert(`Failed to delete partner: ${error}`);
      } else {
        deleteModal.closeModal();
        router.push("/partners");
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
      alert("Failed to delete partner. Please try again.");
    }
  };

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Partner Details" />
        <div className="mt-6 flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <CircularLoader text="Loading partner details..." />
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Partner Details" />
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-center text-gray-600 dark:text-gray-400">Partner not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={partner.name} />
      
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-6 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        {/* Header with Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              {partner.name}
            </h3>
            <div className="mt-2">
              <Badge size="sm" color={getStatusColor(partner.status)}>
                {partner.status}
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
            <Button size="sm" variant="outline" onClick={() => router.push("/partners")}>
              Back to Partners
            </Button>
          </div>
        </div>

        {/* Partner Details Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Contact Information */}
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Contact Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Name
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {partner.name}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Email
                </label>
                <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                  {partner.email}
                </p>
              </div>

              {partner.phone && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Phone
                  </label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {partner.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Company Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Company
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {partner.company}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Additional Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Status
                </label>
                <div className="mt-1">
                  <Badge size="sm" color={getStatusColor(partner.status)}>
                    {partner.status}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Join Date
                </label>
                <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                  {partner.joinDate}
                </p>
              </div>

              {partner.createdAt && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Created At
                  </label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {new Date(partner.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {partner.updatedAt && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </label>
                  <p className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">
                    {new Date(partner.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Partner Modal */}
      <EditPartnerModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleEditPartner}
      />

      {/* Delete Partner Modal */}
      <DeletePartnerModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        partner={partner}
        onConfirm={handleDeletePartner}
      />
    </div>
  );
}

