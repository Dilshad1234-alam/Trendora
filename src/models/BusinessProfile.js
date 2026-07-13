import mongoose from "mongoose";

const businessProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    businessType: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    services: [
      {
        type: String,
      },
    ],

    targetCustomers: {
      type: String,
      default: "",
    },

    goal: {
      type: String,
      required: true,
    },

    onlinePresence: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const BusinessProfile =
  mongoose.models.BusinessProfile ||
  mongoose.model("BusinessProfile", businessProfileSchema);

export default BusinessProfile;