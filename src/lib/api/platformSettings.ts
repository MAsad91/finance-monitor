import { apiClient } from "./client";

export interface PlatformSettings {
  id: string;
  platformName: string;
  platformFeePercentage: number;
  withdrawalFees: {
    platformToPayoneer?: {
      amount: number;
      currency: string;
    };
    platformToLocalBank?: {
      amount: number;
      currency: string;
    };
    payoneerToLocalBank?: {
      amount: number;
      currency: string;
    };
  };
  isCustom: boolean;
  userId?: string;
}

export interface PlatformSettingsFormData {
  platformName: string;
  platformFeePercentage: number;
  withdrawalFees?: {
    platformToPayoneer?: {
      amount: number;
      currency: string;
    };
    platformToLocalBank?: {
      amount: number;
      currency: string;
    };
    payoneerToLocalBank?: {
      amount: number;
      currency: string;
    };
  };
  isCustom?: boolean;
}

export const platformSettingsApi = {
  getAll: async (): Promise<{ data: PlatformSettings[] | null; error: string | null }> => {
    return apiClient.get<PlatformSettings[]>("/api/platform-settings");
  },

  createOrUpdate: async (
    settings: PlatformSettingsFormData
  ): Promise<{ data: PlatformSettings | null; error: string | null }> => {
    return apiClient.post<PlatformSettings>("/api/platform-settings", settings);
  },

  delete: async (id: string): Promise<{ data: null; error: string | null }> => {
    const result = await apiClient.delete<void>(`/api/platform-settings/${id}`);
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: null, error: null };
  },
};

