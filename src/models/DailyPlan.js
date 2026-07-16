import mongoose from "mongoose";

const dailyPlanSchema = new mongoose.Schema(
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

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    format: {
      type: String,
      required: true,
      trim: true,
    },

    hookIdea: {
      type: String,
      required: true,
      trim: true,
    },

    actionSteps: [
      {
        type: String,
        required: true,
      },
    ],

    cta: {
      type: String,
      required: true,
      trim: true,
    },

    postingTime: {
      type: String,
      default: "",
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

    contentGoal: {
      type: String,
      default: "",
      trim: true,
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

dailyPlanSchema.index(
  {
    user: 1,
    dateKey: 1,
  },
  {
    unique: true,
  }
);

const DailyPlan =
  mongoose.models.DailyPlan ||
  mongoose.model("DailyPlan", dailyPlanSchema);

export default DailyPlan;