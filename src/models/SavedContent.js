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
      enum: ["creator", "business"],
      required: true,
      index: true,
    },

    generatedContent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GeneratedContent",
      default: null,
      // required: false,
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
      ],
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const SavedContent =
  mongoose.models.SavedContent ||
  mongoose.model("SavedContent", savedContentSchema);

export default SavedContent;