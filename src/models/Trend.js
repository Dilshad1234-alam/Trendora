import mongoose from "mongoose";

const trendSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      default: "",
    },

    stage: {
      type: String,
      enum: ["new", "growing", "peak", "declining"],
      default: "new",
    },

    freshnessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    saturationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    potentialScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    suitableNiches: [
      {
        type: String,
      },
    ],

    suggestedAngles: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Trend =
  mongoose.models.Trend || mongoose.model("Trend", trendSchema);

export default Trend;