import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  projectTitle: string;
  projectPrice: number;
  priceType: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  platformFeePercentage: number; // Platform fee percentage (from settings or override)
  platformFeeAmount?: number; // Calculated amount
  platformName: string;
  projectStartDate: string;
  projectEndDate?: string;
  status: "Completed" | "in progress" | "Active" | "Inactive";
  includeCharity: boolean; // Whether to include 10% charity deduction
  partners: Array<{
    id: string;
    partnerId?: string; // Reference to Partner document
    name: string;
    sharePercentage: number;
  }>;
  // Calculated fields
  totalAmount?: number;
  afterPlatformFee?: number;
  charityAmount?: number; // 5% of the amount remaining after platform + withdrawal fees when enabled
  afterCharity?: number; // Amount after charity deduction
  allocatedExpenses?: number; // Withdrawal fees or other cash-out charges tied to this project
  afterExpenses?: number; // Amount after withdrawal fees
  allocatedDisputes?: number; // Deprecated: disputes no longer affect payouts
  afterDisputes?: number; // Deprecated: kept for backwards compatibility
  partnerShareAmount?: number; // Deprecated: partners share the final amount directly
  finalAmount?: number; // Final amount after platform fees, withdrawals, and optional charity
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const ProjectPartnerSchema = new Schema(
  {
    id: { type: String, required: true },
    partnerId: { type: String }, // Reference to Partner document
    name: { type: String, required: true },
    sharePercentage: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    projectTitle: { type: String, required: true },
    projectPrice: { type: Number, required: true },
    priceType: {
      type: String,
      enum: ["inr", "dollars", "euro", "pkr", "gbp", "cad", "aud"],
      required: true,
    },
    platformFeePercentage: { type: Number, required: true, min: 0, max: 100 },
    platformFeeAmount: { type: Number },
    platformName: { type: String, required: true },
    projectStartDate: { type: String, required: true },
    projectEndDate: { type: String },
    status: {
      type: String,
      enum: ["Completed", "in progress", "Active", "Inactive"],
      required: true,
    },
    partners: { type: [ProjectPartnerSchema], default: [] },
    includeCharity: { type: Boolean, default: false },
    // Calculated fields
    totalAmount: { type: Number },
    afterPlatformFee: { type: Number },
    charityAmount: { type: Number },
    afterCharity: { type: Number },
    allocatedExpenses: { type: Number },
    afterExpenses: { type: Number },
    allocatedDisputes: { type: Number },
    afterDisputes: { type: Number },
    partnerShareAmount: { type: Number },
    finalAmount: { type: Number },
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Exchange rates relative to INR (approximate, for calculation purposes)
// These rates represent: 1 INR = X units of the currency
const EXCHANGE_RATES_TO_INR: { [key: string]: number } = {
  inr: 1,
  dollars: 0.012, // 1 INR = 0.012 USD
  dollar: 0.012, // Alias for dollars
  euro: 0.011, // 1 INR = 0.011 EUR
  pkr: 3.33, // 1 INR = 3.33 PKR
  gbp: 0.0095, // 1 INR = 0.0095 GBP
  cad: 0.016, // 1 INR = 0.016 CAD
  aud: 0.018, // 1 INR = 0.018 AUD
};

// Convert currency function - converts between any two currencies
function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) return amount;

  // Normalize currency names (handle "dollars" vs "dollar")
  const normalizeCurrency = (curr: string): string => {
    const normalized = curr.toLowerCase();
    if (normalized === "dollars" || normalized === "dollar") return "dollar";
    return normalized;
  };

  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);

  // If same after normalization, return original amount
  if (from === to) return amount;

  // Get exchange rates
  const fromRate = EXCHANGE_RATES_TO_INR[from];
  const toRate = EXCHANGE_RATES_TO_INR[to];

  // If rates not found, return original amount (shouldn't happen with valid currencies)
  if (!fromRate || !toRate) {
    console.warn(`Currency conversion rate not found: ${from} or ${to}`);
    return amount;
  }

  // Convert to INR first (base currency)
  // If from currency is INR, amount is already in INR
  // Otherwise: amountInINR = amount / (1 / fromRate) = amount * (1 / fromRate)
  // But since fromRate is "1 INR = X units", we need: amountInINR = amount / fromRate
  // Actually, if 1 INR = 0.012 USD, then 1 USD = 1/0.012 INR = 83.33 INR
  // So: amountInINR = amount / fromRate
  const amountInINR = from === "inr" ? amount : amount / fromRate;

  // Convert from INR to target currency
  // If to currency is INR, return amountInINR
  // Otherwise: result = amountInINR * toRate
  const result = to === "inr" ? amountInINR : amountInINR * toRate;

  return result;
}

// Pre-save hook to calculate amounts
ProjectSchema.pre("save", async function () {
  const project = this as IProject;

  // Total amount is the project price
  project.totalAmount = project.projectPrice;

  // Calculate platform fee amount
  const platformFeePercentage = project.platformFeePercentage || 0;
  project.platformFeeAmount = (project.projectPrice * platformFeePercentage) / 100;

  // Amount after platform fee
  project.afterPlatformFee = project.projectPrice - (project.platformFeeAmount || 0);

  // Withdrawal fees are stored in allocatedExpenses
  const withdrawalFees = project.allocatedExpenses || 0;
  const afterWithdrawalFees = project.afterPlatformFee - withdrawalFees;
  project.afterExpenses = afterWithdrawalFees;

  const nonNegativeBase = Math.max(afterWithdrawalFees, 0);

  // Calculate charity amount (5% of the remaining amount if enabled)
  if (project.includeCharity) {
    project.charityAmount = (nonNegativeBase * 5) / 100;
  } else {
    project.charityAmount = 0;
  }

  project.afterCharity = afterWithdrawalFees - (project.charityAmount || 0);

  // Disputes are no longer deducted but fields are kept for backward compatibility
  project.allocatedDisputes = 0;
  project.afterDisputes = project.afterCharity;

  // Final amount after platform fees, withdrawal fees (expenses), and optional charity
  // Ensure finalAmount is never negative
  project.finalAmount = Math.max(project.afterCharity || 0, 0);

  // Partner share amount is the total amount that will be distributed among partners
  // This equals finalAmount when partners exist (partners divide the finalAmount)
  const partners = Array.isArray(project.partners) ? project.partners : [];
  const totalPartnerSharePercentage = partners.reduce(
    (sum, p) => sum + (p.sharePercentage || 0),
    0
  );
  
  // Calculate partner share amount: if partners exist, it equals the final amount
  // Partners divide the finalAmount among themselves based on their share percentages
  // CRITICAL: Always calculate this - it's essential for partner distribution
  const calculatedPartnerShare = (totalPartnerSharePercentage > 0 && project.finalAmount > 0) 
    ? project.finalAmount 
    : 0;
  
  project.partnerShareAmount = calculatedPartnerShare;
  
  // Debug logging to track calculation
  console.log(`[Project Pre-Save ${project._id}] Calculation summary:`, {
    projectPrice: project.projectPrice,
    platformFeeAmount: project.platformFeeAmount,
    afterPlatformFee: project.afterPlatformFee,
    allocatedExpenses: project.allocatedExpenses,
    afterExpenses: project.afterExpenses,
    charityAmount: project.charityAmount,
    afterCharity: project.afterCharity,
    finalAmount: project.finalAmount,
    partnersCount: partners.length,
    partners: partners.map(p => `${p.name} (${p.sharePercentage}%)`),
    totalSharePercentage: totalPartnerSharePercentage,
    partnerShareAmount: project.partnerShareAmount,
    calculatedCorrectly: calculatedPartnerShare === project.partnerShareAmount,
  });
});

// Add virtual id field
ProjectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
ProjectSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const ProjectModel: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default ProjectModel;
