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

export interface ExpenseFormData {
  name: string;
  amount: string;
  currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  paymentType: "monthly" | "yearly" | "one-time" | "quarterly" | "bi-annual";
  category: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Cancelled" | "Completed";
  paymentDate: string;
  notes: string;
  projectIds: string[];
}

