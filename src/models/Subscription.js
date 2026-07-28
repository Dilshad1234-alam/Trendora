import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["creator-pro", "business-pro", "agency"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "past_due", "canceled", "expired", "trialing"],
      default: "active",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ currentPeriodEnd: 1 });

const Subscription =
  mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
