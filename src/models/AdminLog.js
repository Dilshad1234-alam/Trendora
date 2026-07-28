import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "plan_update",
        "user_deleted",
        "user_suspended",
        "user_activated",
        "trial_reset",
        "settings_changed",
        "admin_created",
        "admin_removed",
        "payment_processed",
        "system_warning",
        "other",
      ],
      index: true,
    },
    details: {
      type: String,
      required: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

adminLogSchema.index({ createdAt: -1 });

const AdminLog =
  mongoose.models.AdminLog || mongoose.model("AdminLog", adminLogSchema);

export default AdminLog;
