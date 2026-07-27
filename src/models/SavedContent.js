import mongoose from "mongoose";

const savedContentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ownerType: {
      type: String,
      enum: ["creator", "business", "agency"],
      required: true,
      index: true,
    },

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
    
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgencyTeam",
      default: null,
    },
    
    clientType: {
      type: String,
      enum: ["creator", "business"],
      default: null,
    },
    
    campaignId: {
      type: String,
      trim: true,
      default: "",
    },

    generatedContent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GeneratedContent",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
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
        "weekly-plan",

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
        "competitor-analysis",
      ],
      required: true,
      index: true,
    },

    pipelineStage: {
      type: String,
      enum: [
        "ideation",
        "drafted",
        "draft",
        "internal-review",
        "review",
        "client-review",
        "approved",
        "rejected",
        "scheduled",
        "published"
      ],
      default: "ideation",
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

    content: {
      type: String,
      required: true,
      trim: true,
    },

    platform: {
      type: String,
      trim: true,
      default: "",
    },

    scheduledFor: {
      type: Date,
      default: null,
    },

    approvalRequestedAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

savedContentSchema.index({ agencyId: 1, clientId: 1, pipelineStage: 1 });
savedContentSchema.index({ agencyId: 1, createdAt: -1 });
savedContentSchema.index({ user: 1, ownerType: 1, createdAt: -1 });

const SavedContent =
  mongoose.models.SavedContent ||
  mongoose.model("SavedContent", savedContentSchema);

export default SavedContent;