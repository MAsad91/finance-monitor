// Partner interface for project partners
export interface ProjectPartner {
  id: string;
  partnerId?: string; // Reference to Partner document
  name: string;
  sharePercentage: number;
}

// Project interface
export interface Project {
  id: string;
  projectTitle: string;
  projectPrice: number;
  priceType: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  platformFeePercentage: number; // Percentage
  platformFeeAmount?: number; // Calculated amount
  platformName: string;
  projectStartDate: string;
  projectEndDate?: string;
  status: "Completed" | "in progress" | "Active" | "Inactive";
  includeCharity: boolean; // Whether to include 10% charity deduction
  partners: ProjectPartner[];
  // Calculated fields
  totalAmount?: number;
  afterPlatformFee?: number;
  charityAmount?: number; // 5% of afterPlatformFee if includeCharity is true
  afterCharity?: number; // Amount after charity deduction
  allocatedExpenses?: number; // Withdrawal fees allocated to this project
  afterExpenses?: number; // Amount after withdrawal fees
  allocatedDisputes?: number; // Deprecated - disputes no longer deducted
  afterDisputes?: number; // Deprecated - mirrors afterCharity for compatibility
  partnerShareAmount?: number; // Deprecated - partners now split finalAmount
  finalAmount?: number; // Final amount after platform fees, withdrawal fees, and optional charity
  createdAt: string;
  updatedAt?: string;
}

