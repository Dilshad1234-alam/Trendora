import mongoose from "mongoose";

const businessActionStepSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const businessDailyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    dateKey: {
      type: String,
      required: true,
    },

    businessGoal: {
      type: String,
      required: true,
      trim: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    platform: {
      type: String,
      required: true,
      trim: true,
    },

    contentType: {
      type: String,
      required: true,
      trim: true,
    },

    offerIdea: {
      type: String,
      default: "",
      trim: true,
    },

    targetCustomer: {
      type: String,
      default: "",
      trim: true,
    },

    actionSteps: {
      type: [businessActionStepSchema],
      default: [],
    },

    cta: {
      type: String,
      required: true,
      trim: true,
    },

    postingTime: {
      type: String,
      default: "",
      trim: true,
    },

    aiTip: {
      type: String,
      default: "",
      trim: true,
    },

    estimatedTime: {
      type: String,
      default: "45 minutes",
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    source: {
      type: String,
      enum: ["ai", "fallback"],
      default: "ai",
    },

    completed: {
      type: Boolean,
      default: false,
    },

    regenerationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

businessDailyPlanSchema.index(
  {
    user: 1,
    dateKey: 1,
  },
  {
    unique: true,
  }
);

const BusinessDailyPlan =
  mongoose.models.BusinessDailyPlan ||
  mongoose.model(
    "BusinessDailyPlan",
    businessDailyPlanSchema
  );

export default BusinessDailyPlan;