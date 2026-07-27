import mongoose from "mongoose";

const agencyTeamSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Agency ID is required"],
    },
    memberName: {
      type: String,
      required: [true, "Member name is required"],
      trim: true,
    },
    memberEmail: {
      type: String,
      required: [true, "Member email is required"],
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "editor",
    },
    status: {
      type: String,
      enum: ["active", "invited", "revoked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV === "development" && mongoose.models.AgencyTeam) {
  delete mongoose.models.AgencyTeam;
}

const AgencyTeam = mongoose.models.AgencyTeam || mongoose.model("AgencyTeam", agencyTeamSchema);

export default AgencyTeam;
