"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import { platformSettingsApi, PlatformSettings } from "@/lib/api/platformSettings";
import Button from "@/components/ui/button/Button";

interface PlatformSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: () => void;
}

export default function PlatformSettingsModal({
  isOpen,
  onClose,
  onSettingsUpdated,
}: PlatformSettingsModalProps) {
  const [platforms, setPlatforms] = useState<PlatformSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<PlatformSettings | null>(null);
  const [isNewPlatform, setIsNewPlatform] = useState(false);

  const [formData, setFormData] = useState({
    platformName: "",
    platformFeePercentage: "",
    withdrawalFees: {
      platformToPayoneer: { amount: "", currency: "dollars" },
      platformToLocalBank: { amount: "", currency: "dollars" },
      payoneerToLocalBank: { amount: "", currency: "dollars" },
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchPlatforms();
    }
  }, [isOpen]);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const { data, error } = await platformSettingsApi.getAll();
      if (error) {
        console.error("Error fetching platforms:", error);
        alert("Failed to load platform settings");
      } else {
        setPlatforms(data || []);
      }
    } catch (error) {
      console.error("Error fetching platforms:", error);
      alert("Failed to load platform settings");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (platform: PlatformSettings) => {
    // Check if it's a well-known platform (userId is "system" or isCustom is false)
    if (!platform.isCustom || platform.userId === "system") {
      alert("Well-known platforms cannot be edited. Create a custom platform instead.");
      return;
    }
    setEditingPlatform(platform);
    setIsNewPlatform(false);
    setFormData({
      platformName: platform.platformName,
      platformFeePercentage: platform.platformFeePercentage.toString(),
      withdrawalFees: {
        platformToPayoneer: platform.withdrawalFees.platformToPayoneer
          ? {
              amount: platform.withdrawalFees.platformToPayoneer.amount.toString(),
              currency: platform.withdrawalFees.platformToPayoneer.currency,
            }
          : { amount: "", currency: "dollars" },
        platformToLocalBank: platform.withdrawalFees.platformToLocalBank
          ? {
              amount: platform.withdrawalFees.platformToLocalBank.amount.toString(),
              currency: platform.withdrawalFees.platformToLocalBank.currency,
            }
          : { amount: "", currency: "dollars" },
        payoneerToLocalBank: platform.withdrawalFees.payoneerToLocalBank
          ? {
              amount: platform.withdrawalFees.payoneerToLocalBank.amount.toString(),
              currency: platform.withdrawalFees.payoneerToLocalBank.currency,
            }
          : { amount: "", currency: "dollars" },
      },
    });
  };

  const handleAddNew = () => {
    setEditingPlatform(null);
    setIsNewPlatform(true);
    setFormData({
      platformName: "",
      platformFeePercentage: "",
      withdrawalFees: {
        platformToPayoneer: { amount: "", currency: "dollars" },
        platformToLocalBank: { amount: "", currency: "dollars" },
        payoneerToLocalBank: { amount: "", currency: "dollars" },
      },
    });
  };

  const handleCancel = () => {
    setEditingPlatform(null);
    setIsNewPlatform(false);
    setFormData({
      platformName: "",
      platformFeePercentage: "",
      withdrawalFees: {
        platformToPayoneer: { amount: "", currency: "dollars" },
        platformToLocalBank: { amount: "", currency: "dollars" },
        payoneerToLocalBank: { amount: "", currency: "dollars" },
      },
    });
  };

  const handleSave = async () => {
    if (!formData.platformName || !formData.platformFeePercentage) {
      alert("Please fill in platform name and fee percentage");
      return;
    }

    try {
      setSaving(true);
      const withdrawalFees: any = {};
      
      if (formData.withdrawalFees.platformToPayoneer.amount) {
        withdrawalFees.platformToPayoneer = {
          amount: parseFloat(formData.withdrawalFees.platformToPayoneer.amount),
          currency: formData.withdrawalFees.platformToPayoneer.currency,
        };
      }
      
      if (formData.withdrawalFees.platformToLocalBank.amount) {
        withdrawalFees.platformToLocalBank = {
          amount: parseFloat(formData.withdrawalFees.platformToLocalBank.amount),
          currency: formData.withdrawalFees.platformToLocalBank.currency,
        };
      }
      
      if (formData.withdrawalFees.payoneerToLocalBank.amount) {
        withdrawalFees.payoneerToLocalBank = {
          amount: parseFloat(formData.withdrawalFees.payoneerToLocalBank.amount),
          currency: formData.withdrawalFees.payoneerToLocalBank.currency,
        };
      }

      const { error } = await platformSettingsApi.createOrUpdate({
        platformName: formData.platformName,
        platformFeePercentage: parseFloat(formData.platformFeePercentage),
        withdrawalFees,
        isCustom: true,
      });

      if (error) {
        alert(`Failed to save platform settings: ${error}`);
      } else {
        handleCancel();
        fetchPlatforms();
        onSettingsUpdated();
      }
    } catch (error) {
      console.error("Error saving platform settings:", error);
      alert("Failed to save platform settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (platform: PlatformSettings) => {
    // Check if it's a well-known platform (userId is "system" or isCustom is false)
    if (!platform.isCustom || platform.userId === "system") {
      alert("Well-known platforms cannot be deleted");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${platform.platformName}"?`)) {
      return;
    }

    try {
      const { error } = await platformSettingsApi.delete(platform.id);
      if (error) {
        alert(`Failed to delete platform: ${error}`);
      } else {
        fetchPlatforms();
        onSettingsUpdated();
      }
    } catch (error) {
      console.error("Error deleting platform:", error);
      alert("Failed to delete platform");
    }
  };

  // Well-known platforms are those with userId "system" or isCustom false
  const wellKnownPlatforms = platforms.filter((p) => !p.isCustom || p.userId === "system");
  const customPlatforms = platforms.filter((p) => p.isCustom && p.userId !== "system");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[900px] p-5 lg:p-10 mt-20"
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
              Platform Settings
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage platform fees and withdrawal fees
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Platform
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Well-known Platforms */}
            {wellKnownPlatforms.length > 0 && (
              <div>
                <h5 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Well-Known Platforms
                </h5>
                <div className="space-y-2">
                  {wellKnownPlatforms.map((platform) => (
                    <PlatformCard
                      key={platform.id || platform.platformName || `well-known-${platform.platformName}`}
                      platform={platform}
                      onEdit={() => handleEdit(platform)}
                      onDelete={() => handleDelete(platform)}
                      canEdit={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Platforms */}
            {customPlatforms.length > 0 && (
              <div>
                <h5 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Custom Platforms
                </h5>
                <div className="space-y-2">
                  {customPlatforms.map((platform) => (
                    <PlatformCard
                      key={platform.id || platform.platformName || `custom-${platform.platformName}`}
                      platform={platform}
                      onEdit={() => handleEdit(platform)}
                      onDelete={() => handleDelete(platform)}
                      canEdit={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add/Edit Form */}
            {(isNewPlatform || editingPlatform) && (
              <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <h5 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {isNewPlatform ? "Add New Platform" : "Edit Platform"}
                </h5>
                <div className="space-y-4">
                  <div>
                    <Label>
                      Platform Name <span className="text-error-500">*</span>
                    </Label>
                    <input
                      type="text"
                      value={formData.platformName}
                      onChange={(e) =>
                        setFormData({ ...formData, platformName: e.target.value })
                      }
                      placeholder="e.g., Custom Platform"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  <div>
                    <Label>
                      Platform Fee (%) <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.platformFeePercentage}
                        onChange={(e) =>
                          setFormData({ ...formData, platformFeePercentage: e.target.value })
                        }
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max="100"
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Withdrawal Fees */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Withdrawal Fees (Optional)</Label>
                    
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs">Platform → Payoneer</Label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={formData.withdrawalFees.platformToPayoneer.amount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                withdrawalFees: {
                                  ...formData.withdrawalFees,
                                  platformToPayoneer: {
                                    ...formData.withdrawalFees.platformToPayoneer,
                                    amount: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Amount"
                            step="0.01"
                            min="0"
                            className="h-9 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          />
                          <select
                            value={formData.withdrawalFees.platformToPayoneer.currency}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                withdrawalFees: {
                                  ...formData.withdrawalFees,
                                  platformToPayoneer: {
                                    ...formData.withdrawalFees.platformToPayoneer,
                                    currency: e.target.value,
                                  },
                                },
                              })
                            }
                            className="h-9 w-24 rounded-lg border border-gray-300 bg-transparent px-2 text-xs shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                          >
                            <option value="dollars">USD</option>
                            <option value="inr">INR</option>
                            <option value="euro">EUR</option>
                            <option value="pkr">PKR</option>
                            <option value="gbp">GBP</option>
                            <option value="cad">CAD</option>
                            <option value="aud">AUD</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Platform → Local Bank</Label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={formData.withdrawalFees.platformToLocalBank.amount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                withdrawalFees: {
                                  ...formData.withdrawalFees,
                                  platformToLocalBank: {
                                    ...formData.withdrawalFees.platformToLocalBank,
                                    amount: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Amount"
                            step="0.01"
                            min="0"
                            className="h-9 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          />
                          <select
                            value={formData.withdrawalFees.platformToLocalBank.currency}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                withdrawalFees: {
                                  ...formData.withdrawalFees,
                                  platformToLocalBank: {
                                    ...formData.withdrawalFees.platformToLocalBank,
                                    currency: e.target.value,
                                  },
                                },
                              })
                            }
                            className="h-9 w-24 rounded-lg border border-gray-300 bg-transparent px-2 text-xs shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                          >
                            <option value="dollars">USD</option>
                            <option value="inr">INR</option>
                            <option value="euro">EUR</option>
                            <option value="pkr">PKR</option>
                            <option value="gbp">GBP</option>
                            <option value="cad">CAD</option>
                            <option value="aud">AUD</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Payoneer → Local Bank</Label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={formData.withdrawalFees.payoneerToLocalBank.amount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                withdrawalFees: {
                                  ...formData.withdrawalFees,
                                  payoneerToLocalBank: {
                                    ...formData.withdrawalFees.payoneerToLocalBank,
                                    amount: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Amount"
                            step="0.01"
                            min="0"
                            className="h-9 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          />
                          <select
                            value={formData.withdrawalFees.payoneerToLocalBank.currency}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                withdrawalFees: {
                                  ...formData.withdrawalFees,
                                  payoneerToLocalBank: {
                                    ...formData.withdrawalFees.payoneerToLocalBank,
                                    currency: e.target.value,
                                  },
                                },
                              })
                            }
                            className="h-9 w-24 rounded-lg border border-gray-300 bg-transparent px-2 text-xs shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                          >
                            <option value="dollars">USD</option>
                            <option value="inr">INR</option>
                            <option value="euro">EUR</option>
                            <option value="pkr">PKR</option>
                            <option value="gbp">GBP</option>
                            <option value="cad">CAD</option>
                            <option value="aud">AUD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex w-full items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Platform Card Component
function PlatformCard({
  platform,
  onEdit,
  onDelete,
  canEdit,
}: {
  platform: PlatformSettings;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {platform.platformName}
          </p>
          {(!platform.isCustom || platform.userId === "system") && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Well-known
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Platform Fee: {platform.platformFeePercentage}%
        </p>
        {platform.withdrawalFees && (
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
            {platform.withdrawalFees.platformToPayoneer && (
              <span key="platformToPayoneer">
                Platform→Payoneer: {platform.withdrawalFees.platformToPayoneer.amount}{" "}
                {platform.withdrawalFees.platformToPayoneer.currency.toUpperCase()}
              </span>
            )}
            {platform.withdrawalFees.platformToLocalBank && (
              <span key="platformToLocalBank">
                Platform→Bank: {platform.withdrawalFees.platformToLocalBank.amount}{" "}
                {platform.withdrawalFees.platformToLocalBank.currency.toUpperCase()}
              </span>
            )}
            {platform.withdrawalFees.payoneerToLocalBank && (
              <span key="payoneerToLocalBank">
                Payoneer→Bank: {platform.withdrawalFees.payoneerToLocalBank.amount}{" "}
                {platform.withdrawalFees.payoneerToLocalBank.currency.toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
      {canEdit && (
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Edit"
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
            onClick={onDelete}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete"
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
      )}
    </div>
  );
}

