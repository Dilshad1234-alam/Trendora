import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Step text is required"],
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const agencyDailyPlanSchema = new mongoose.Schema(
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
      index: true,
    },
    agencyGoal: {
      type: String,
      required: [true, "Agency goal is required"],
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
    },
    clientFocus: {
      type: String,
      default: "General Agency Growth",
    },
    actionSteps: {
      type: [stepSchema],
      default: [],
    },
    aiTip: {
      type: String,
    },
    estimatedTime: {
      type: String,
      default: "60 minutes",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
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
    },
  },
  {
    timestamps: true,
  }
);

agencyDailyPlanSchema.index({ user: 1, dateKey: 1 }, { unique: true });

if (process.env.NODE_ENV === "development" && mongoose.models.AgencyDailyPlan) {
  delete mongoose.models.AgencyDailyPlan;
}

const AgencyDailyPlan = mongoose.models.AgencyDailyPlan || mongoose.model("AgencyDailyPlan", agencyDailyPlanSchema);

export default AgencyDailyPlan;
