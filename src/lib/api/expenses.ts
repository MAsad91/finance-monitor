import { apiClient } from "./client";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  paymentType: "monthly" | "yearly" | "one-time" | "quarterly" | "bi-annual";
  category: string;
  startDate: string;
  endDate?: string;
  status: "Active" | "Cancelled" | "Completed";
  paymentDate: string;
  notes?: string;
  projectIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export const expensesApi = {
  // Get all expenses
  getAll: async (): Promise<{ data: Expense[] | null; error: string | null }> => {
    const response = await apiClient.get<{ expenses: Expense[] }>("/api/expenses");
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.expenses || [], error: null };
  },

  // Get single expense
  getById: async (id: string): Promise<{ data: Expense | null; error: string | null }> => {
    const response = await apiClient.get<{ expense: Expense }>(`/api/expenses/${id}`);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.expense || null, error: null };
  },

  // Create expense
  create: async (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">): Promise<{ data: Expense | null; error: string | null }> => {
    const response = await apiClient.post<{ expense: Expense }>("/api/expenses", expense);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.expense || null, error: null };
  },

  // Update expense
  update: async (id: string, expense: Partial<Omit<Expense, "id" | "createdAt" | "updatedAt">>): Promise<{ data: Expense | null; error: string | null }> => {
    const response = await apiClient.put<{ expense: Expense }>(`/api/expenses/${id}`, expense);
    if (response.error) {
      return { data: null, error: response.error };
    }
    return { data: response.data?.expense || null, error: null };
  },

  // Delete expense
  delete: async (id: string): Promise<{ error: string | null }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/expenses/${id}`);
    if (response.error) {
      return { error: response.error };
    }
    return { error: null };
  },
};

