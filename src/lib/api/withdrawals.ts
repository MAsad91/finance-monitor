import { apiClient } from "./client";

export interface Withdrawal {
  id: string;
  amount: number;
  currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  method: string;
  account: string;
  projectIds: string[];
  withdrawalFee?: number;
  withdrawalFeeType?: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  withdrawalFeeLocalAccount?: number;
  withdrawalFeeLocalAccountType?: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  status: "Pending" | "Processing" | "Completed" | "Failed";
  requestDate: string;
  processDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export const withdrawalsApi = {
  // Get all withdrawals
  getAll: async (): Promise<{ data: Withdrawal[] | null; error: string | null }> => {
    const response = await apiClient.get<{ withdrawals: Withdrawal[] }>("/api/withdrawals");
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.withdrawals || [], error: null };
  },

  // Get single withdrawal
  getById: async (id: string): Promise<{ data: Withdrawal | null; error: string | null }> => {
    const response = await apiClient.get<{ withdrawal: Withdrawal }>(`/api/withdrawals/${id}`);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.withdrawal || null, error: null };
  },

  // Create withdrawal
  create: async (withdrawal: Omit<Withdrawal, "id" | "createdAt" | "updatedAt">): Promise<{ data: Withdrawal | null; error: string | null }> => {
    const response = await apiClient.post<{ withdrawal: Withdrawal }>("/api/withdrawals", withdrawal);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.withdrawal || null, error: null };
  },

  // Update withdrawal
  update: async (id: string, withdrawal: Partial<Omit<Withdrawal, "id" | "createdAt" | "updatedAt">>): Promise<{ data: Withdrawal | null; error: string | null }> => {
    const response = await apiClient.put<{ withdrawal: Withdrawal }>(`/api/withdrawals/${id}`, withdrawal);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.withdrawal || null, error: null };
  },

  // Delete withdrawal
  delete: async (id: string): Promise<{ error: string | null }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/withdrawals/${id}`);
    if (response.error) {
      return { error: response.error };
    }
    return { error: null };
  },
};

