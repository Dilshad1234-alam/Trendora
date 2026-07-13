import mongoose from "mongoose";

const creatorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    niche: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    platform: {
      type: String,
      required: true,
    },

    tone: {
      type: String,
      required: true,
    },

    audienceSize: {
      type: String,
      default: "",
    },

    goal: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CreatorProfile =
  mongoose.models.CreatorProfile ||
  mongoose.model("CreatorProfile", creatorProfileSchema);

export default CreatorProfile;