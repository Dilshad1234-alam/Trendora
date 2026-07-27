import mongoose from "mongoose";

const agencyClientSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Agency ID is required"],
    },
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    company: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "lead"],
      default: "active",
    },
    notes: {
      type: String,
    },
    brandVoice: {
      type: String,
      trim: true,
      default: "Professional and Authoritative",
    },
    targetAudience: {
      type: String,
      trim: true,
      default: "General Audience",
    },
    customRules: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV === "development" && mongoose.models.AgencyClient) {
  delete mongoose.models.AgencyClient;
}

const AgencyClient = mongoose.models.AgencyClient || mongoose.model("AgencyClient", agencyClientSchema);

export default AgencyClient;
