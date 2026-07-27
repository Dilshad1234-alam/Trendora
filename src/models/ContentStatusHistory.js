import mongoose from "mongoose";

const contentStatusHistorySchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgencyClient",
      required: true,
      index: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavedContent",
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      required: true,
      enum: [
        "draft",
        "internal-review",
        "client-review",
        "approved",
        "rejected",
        "scheduled",
        "published"
      ],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast history lookups
contentStatusHistorySchema.index({ contentId: 1, createdAt: -1 });

export default mongoose.models.ContentStatusHistory ||
  mongoose.model("ContentStatusHistory", contentStatusHistorySchema);
