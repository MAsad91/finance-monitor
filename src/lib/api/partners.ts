import { apiClient } from "./client";

export interface Partner {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: "Active" | "Inactive";
  joinDate: string;
  totalReceived?: number; // Total amount received by this partner across all projects
  totalReceivedCurrency?: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  createdAt: string;
  updatedAt?: string;
}

export const partnersApi = {
  // Get all partners
  getAll: async (): Promise<{ data: Partner[] | null; error: string | null }> => {
    const response = await apiClient.get<{ partners: Partner[] }>("/api/partners");
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.partners || [], error: null };
  },

  // Get single partner
  getById: async (id: string): Promise<{ data: Partner | null; error: string | null }> => {
    const response = await apiClient.get<{ partner: Partner }>(`/api/partners/${id}`);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.partner || null, error: null };
  },

  // Create partner
  create: async (partner: Omit<Partner, "id" | "createdAt" | "updatedAt">): Promise<{ data: Partner | null; error: string | null }> => {
    const response = await apiClient.post<{ partner: Partner }>("/api/partners", partner);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.partner || null, error: null };
  },

  // Update partner
  update: async (id: string, partner: Partial<Omit<Partner, "id" | "createdAt" | "updatedAt">>): Promise<{ data: Partner | null; error: string | null }> => {
    const response = await apiClient.put<{ partner: Partner }>(`/api/partners/${id}`, partner);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.partner || null, error: null };
  },

  // Delete partner
  delete: async (id: string): Promise<{ error: string | null }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/partners/${id}`);
    if (response.error) {
      return { error: response.error };
    }
    return { error: null };
  },
};

