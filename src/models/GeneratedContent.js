import mongoose from "mongoose";

const generatedContentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

const GeneratedContent =
  mongoose.models.GeneratedContent ||
  mongoose.model("GeneratedContent", generatedContentSchema);

export default GeneratedContent;