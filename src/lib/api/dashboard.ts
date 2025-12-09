import { apiClient } from "./client";

export interface DashboardMetrics {
  totalRevenue: {
    value: number;
    formatted: string;
    growth: number;
  };
  totalExpenses: {
    value: number;
    formatted: string;
    growth: number;
  };
  netProfit: {
    value: number;
    formatted: string;
    growth: number;
  };
  activeProjects: {
    value: number;
  };
}

export interface DashboardData {
  metrics: DashboardMetrics;
  monthlyRevenue: number[];
  monthlyExpenses: number[];
  period: string;
  categories: string[];
  currentMonth: {
    revenue: number;
    expenses: number;
    budgetTarget: number;
    budgetProgress: number;
  };
  categoryBreakdown: { [key: string]: number };
  recentProjects: Array<{
    id: string;
    name: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
    platform: string;
  }>;
}

export const dashboardApi = {
  getDashboardData: async (period: string = "monthly"): Promise<{ data?: DashboardData; error?: string }> => {
    const result = await apiClient.get<DashboardData>(`/api/dashboard?period=${period}`);
    if (result.error) {
      return { error: result.error };
    }
    return { data: result.data || undefined };
  },
};

