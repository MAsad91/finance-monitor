import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPartner extends Document {
  name: string;
  email: string;
  company: string;
  phone: string;
  status: "Active" | "Inactive";
  joinDate: string;
  totalReceived?: number; // Total amount received by this partner across all projects
  totalReceivedCurrency?: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud"; // Currency of total received
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const PartnerSchema = new Schema<IPartner>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: false },
    company: { type: String, required: true },
    phone: { type: String },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      required: true,
      default: "Active",
    },
    joinDate: { type: String, required: true },
    totalReceived: { type: Number, default: 0 },
    totalReceivedCurrency: {
      type: String,
      enum: ["inr", "dollars", "euro", "pkr", "gbp", "cad", "aud"],
      default: "inr",
    },
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Add virtual id field
PartnerSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
PartnerSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const PartnerModel: Model<IPartner> =
  mongoose.models.Partner || mongoose.model<IPartner>("Partner", PartnerSchema);

export default PartnerModel;

