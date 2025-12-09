import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpense extends Document {
  name: string;
  amount: number;
  currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud";
  paymentType: "monthly" | "yearly" | "one-time" | "quarterly" | "bi-annual";
  category: string; // e.g., "Cursor", "Freelancer", "Hosting", etc.
  startDate: string;
  endDate?: string;
  status: "Active" | "Cancelled" | "Completed";
  paymentDate: string;
  notes?: string;
  projectIds?: string[]; // Optional: Link expenses to specific projects
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: {
      type: String,
      enum: ["inr", "dollars", "euro", "pkr", "gbp", "cad", "aud"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["monthly", "yearly", "one-time", "quarterly", "bi-annual"],
      required: true,
    },
    category: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    status: {
      type: String,
      enum: ["Active", "Cancelled", "Completed"],
      required: true,
      default: "Active",
    },
    paymentDate: { type: String, required: true },
    notes: { type: String },
    projectIds: { type: [String], default: [] }, // Optional: Link to projects
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Add virtual id field
ExpenseSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
ExpenseSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const ExpenseModel: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default ExpenseModel;

