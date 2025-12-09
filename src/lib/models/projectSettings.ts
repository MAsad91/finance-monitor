import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectSettings extends Document {
  platformName: string;
  platformFeePercentage: number; // Default platform fee percentage
  withdrawalFees: {
    platformToPayoneer?: {
      amount: number;
      currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
    };
    platformToLocalBank?: {
      amount: number;
      currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
    };
    payoneerToLocalBank?: {
      amount: number;
      currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
    };
  };
  isCustom: boolean; // true for "Other" platforms
  userId: string; // User-specific settings (or "system" for well-known)
  createdAt: string;
  updatedAt: string;
}

const WithdrawalFeeSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      enum: ["inr", "dollars", "euro", "pkr", "gbp", "cad", "aud"],
      required: true,
    },
  },
  { _id: false }
);

const ProjectSettingsSchema = new Schema<IProjectSettings>(
  {
    platformName: { type: String, required: true },
    platformFeePercentage: { type: Number, required: true, min: 0, max: 100 },
    withdrawalFees: {
      platformToPayoneer: { type: WithdrawalFeeSchema },
      platformToLocalBank: { type: WithdrawalFeeSchema },
      payoneerToLocalBank: { type: WithdrawalFeeSchema },
    },
    isCustom: { type: Boolean, default: false },
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Add virtual id field
ProjectSettingsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
ProjectSettingsSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Index for faster lookups
ProjectSettingsSchema.index({ userId: 1, platformName: 1 });

const ProjectSettingsModel: Model<IProjectSettings> =
  mongoose.models.ProjectSettings ||
  mongoose.model<IProjectSettings>("ProjectSettings", ProjectSettingsSchema);

export default ProjectSettingsModel;

