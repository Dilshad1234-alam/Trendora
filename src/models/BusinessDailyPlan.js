import mongoose from "mongoose";

const PLAN_MAX_ACTIONS = 30;

const actionStepSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
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
      trim: true,
      index: true,
    },

    businessGoal: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    platform: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    contentType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    targetCustomer: {
      type: String,
      default: "",
      trim: true,
      maxlength: 250,
    },

    offerIdea: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    actionSteps: {
      type: [actionStepSchema],
      default: [],

      validate: {
        validator(steps) {
          return (
            Array.isArray(steps) &&
            steps.length > 0 &&
            steps.length <= PLAN_MAX_ACTIONS
          );
        },

        message:
          "Daily plan must contain between 1 and 30 action steps.",
      },
    },

    cta: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    postingTime: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    aiTip: {
      type: String,
      default: "",
      trim: true,
      maxlength: 400,
    },

    estimatedTime: {
      type: String,
      default: "45 minutes",
      trim: true,
      maxlength: 50,
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

    completedAt: {
      type: Date,
      default: null,
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

if (mongoose.models.BusinessDailyPlan) {
  delete mongoose.models.BusinessDailyPlan;
}

const BusinessDailyPlan = mongoose.model(
  "BusinessDailyPlan",
  businessDailyPlanSchema
);

export default BusinessDailyPlan;