import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIssue extends Document {
  title: string;
  description: string;
  type: "Dispute" | "Bug" | "Feature Request" | "Other";
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  reportedBy: string;
  reportedDate: string;
  resolvedDate?: string;
  amount?: number; // Financial impact amount (for disputes)
  currency?: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud"; // Currency for amount
  projectIds?: string[]; // Optional: Link disputes to specific projects
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const IssueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["Dispute", "Bug", "Feature Request", "Other"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      required: true,
      default: "Open",
    },
    reportedBy: { type: String, required: true },
    reportedDate: { type: String, required: true },
    resolvedDate: { type: String },
    amount: { type: Number }, // Financial impact
    currency: {
      type: String,
      enum: ["inr", "dollars", "euro", "pkr", "gbp", "cad", "aud"],
    },
    projectIds: { type: [String], default: [] }, // Optional: Link to projects
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Add virtual id field
IssueSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
IssueSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const IssueModel: Model<IIssue> =
  mongoose.models.Issue || mongoose.model<IIssue>("Issue", IssueSchema);

export default IssueModel;

