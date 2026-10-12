import mongoose from "mongoose";

const clauseSchema = new mongoose.Schema(
  {
    clauseId: String,
    text: { type: String, required: true },
    risk: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    reason: String,
    suggestion: String,
  },
  { _id: false }
);

const contractSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    rawText: { type: String, required: true },
    role: { type: String, default: "freelancer" },
    clauses: [clauseSchema],
    redFlags: [String],
    summary: String,
    riskScore: { type: Number, default: 0 },
    highCount: { type: Number, default: 0 },
    mediumCount: { type: Number, default: 0 },
    lowCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["uploaded", "analyzed", "failed"],
      default: "uploaded",
    },
  },
  { timestamps: true }
);

contractSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Contract", contractSchema);