import mongoose from "mongoose";

const agencyClientSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Agency ID is required"],
    },
    clientType: {
      type: String,
      enum: ["creator", "business"],
      required: true,
      default: "business", // safe fallback for legacy records
    },
    // Common
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
    phone: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true, // Legacy field
    },
    status: {
      type: String,
      enum: ["active", "inactive", "lead", "paused", "archived"],
      default: "active",
    },
    notes: {
      type: String,
    },

    // Creator Specific Fields
    creatorName: { type: String, trim: true },
    niche: { type: String, trim: true },
    platforms: { type: [String], default: [] },
    contentGoals: { type: String, trim: true },
    audienceSize: { type: String, trim: true },

    // Business Specific Fields
    businessName: { type: String, trim: true },
    industry: { type: String, trim: true },
    products: { type: [String], default: [] },
    services: { type: [String], default: [] },
    website: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },

    // Shared / AI Brand Memory Fields
    preferredLanguage: { type: String, trim: true, default: "English" },
    tone: { type: String, trim: true, default: "Professional" },
    targetAudience: {
      type: String,
      trim: true,
      default: "General Audience",
    },
    brandVoice: {
      type: String,
      trim: true,
      default: "Professional and Authoritative",
    },
    requiredPhrases: { type: [String], default: [] },
    bannedWords: { type: [String], default: [] },
    customRules: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
agencyClientSchema.index({ agencyId: 1, status: 1 });
agencyClientSchema.index({ agencyId: 1, clientType: 1 });

if (process.env.NODE_ENV === "development" && mongoose.models.AgencyClient) {
  delete mongoose.models.AgencyClient;
}

const AgencyClient =
  mongoose.models.AgencyClient ||
  mongoose.model("AgencyClient", agencyClientSchema);

export default AgencyClient;
