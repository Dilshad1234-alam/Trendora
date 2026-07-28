import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    group: {
      type: String,
      enum: ["general", "pricing", "api_keys", "branding", "smtp", "maintenance"],
      default: "general",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const SystemSettings =
  mongoose.models.SystemSettings || mongoose.model("SystemSettings", systemSettingsSchema);

export default SystemSettings;
