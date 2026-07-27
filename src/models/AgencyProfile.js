import mongoose from "mongoose";

const agencyProfileSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    agencyName: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    businessEmail: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    primaryColor: {
      type: String,
      default: "#7c3aed",
    },
    secondaryColor: {
      type: String,
      default: "#c4b5fd",
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV === "development" && mongoose.models.AgencyProfile) {
  delete mongoose.models.AgencyProfile;
}

const AgencyProfile =
  mongoose.models.AgencyProfile ||
  mongoose.model("AgencyProfile", agencyProfileSchema);

export default AgencyProfile;
