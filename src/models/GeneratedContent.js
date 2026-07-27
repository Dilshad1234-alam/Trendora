import mongoose from "mongoose";

const generatedContentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    // Agency specific fields
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgencyClient",
      default: null,
      index: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    clientType: {
      type: String,
      enum: ["creator", "business"],
      default: null,
    },
    platform: {
      type: String,
      trim: true,
      default: "",
    },
    campaignId: {
      type: String, // String or ObjectId depending on future implementation
      trim: true,
      default: "",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgencyTeam",
      default: null,
    },
    contentStatus: {
      type: String,
      enum: [
        "draft",
        "internal-review",
        "client-review",
        "approved",
        "rejected",
        "scheduled",
        "published"
      ],
      default: "draft",
    },
    scheduledFor: { type: Date, default: null },
    approvalRequestedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },

    type: {
      type: String,
      enum: [
        // Creator
        "hook",
        "script",
        "caption",
        "hashtag",
        "thumbnail-title",
        "video-description",
        "content-rewriter",
        "viral-idea",
        "cta",

        // Business
        "business-post",
        "business-caption",
        "business-hashtag",
        "business-thumbnail-title",
        "business-video-description",
        "ad-copy",
        "product-description",
        "local-seo",
        "review-reply",
        "whatsapp-reply",

        "weekly-plan",
      ],
      required: true,
      index: true,
    },

    prompt: {
      type: String,
      required: true,
    },

    output: {
      type: String,
      required: true,
    },

    trend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trend",
      default: null,
    },

    copied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

generatedContentSchema.index({ agencyId: 1, clientId: 1 });
generatedContentSchema.index({ createdAt: -1 });

const GeneratedContent =
  mongoose.models.GeneratedContent ||
  mongoose.model("GeneratedContent", generatedContentSchema);

export default GeneratedContent;