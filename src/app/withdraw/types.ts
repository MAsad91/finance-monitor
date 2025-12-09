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

export interface WithdrawalFormData {
  amount: string;
  currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  method: string;
  account: string;
  projectIds: string[];
  withdrawalFee: string;
  withdrawalFeeType: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  withdrawalFeeLocalAccount: string;
  withdrawalFeeLocalAccountType: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  status: "Pending" | "Processing" | "Completed" | "Failed";
  requestDate: string;
  processDate: string;
  notes: string;
}

