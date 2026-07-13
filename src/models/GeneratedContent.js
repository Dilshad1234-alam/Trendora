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
        "hook",
        "script",
        "caption",
        "hashtag",
        "local-seo",
        "review-reply",
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