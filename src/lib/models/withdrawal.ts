import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWithdrawal extends Document {
  amount: number;
  currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  method: string; // e.g., "Bank Transfer", "PayPal", "Stripe", etc.
  account: string;
  projectIds: string[]; // Array of project IDs this withdrawal is from
  withdrawalFee?: number;
  withdrawalFeeType?: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  withdrawalFeeLocalAccount?: number;
  withdrawalFeeLocalAccountType?: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  status: "Pending" | "Processing" | "Completed" | "Failed";
  requestDate: string;
  processDate?: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    amount: { type: Number, required: true },
    currency: {
      type: String,
      enum: ["inr", "dollars", "euro", "pkr", "gbp", "cad", "aud"],
      required: true,
    },
    method: { type: String, required: true },
    account: { type: String, required: true },
    projectIds: { type: [String], default: [] },
    withdrawalFee: { type: Number },
    withdrawalFeeType: {
      type: String,
      enum: ["inr", "dollars", "euro", "pkr", "gbp", "cad", "aud"],
    },
    withdrawalFeeLocalAccount: { type: Number },
    withdrawalFeeLocalAccountType: {
      type: String,
      enum: ["inr", "dollars", "euro", "pkr", "gbp", "cad", "aud"],
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Failed"],
      required: true,
      default: "Pending",
    },
    requestDate: { type: String, required: true },
    processDate: { type: String },
    notes: { type: String },
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Add virtual id field
WithdrawalSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
WithdrawalSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const WithdrawalModel: Model<IWithdrawal> =
  mongoose.models.Withdrawal || mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema);

export default WithdrawalModel;

