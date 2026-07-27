import mongoose from "mongoose";

const agencyBrandingSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Agency ID is required"],
      unique: true,
    },
    brandName: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    primaryColor: {
      type: String,
      default: "#6d28d9", // Default violet color
    },
    customDomain: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV === "development" && mongoose.models.AgencyBranding) {
  delete mongoose.models.AgencyBranding;
}

const AgencyBranding = mongoose.models.AgencyBranding || mongoose.model("AgencyBranding", agencyBrandingSchema);

export default AgencyBranding;
