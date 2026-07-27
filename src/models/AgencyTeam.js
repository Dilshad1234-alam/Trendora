import mongoose from "mongoose";

const ROLE_PERMISSIONS = {
  owner: ["full_access"],
  admin: ["manage_clients", "manage_content", "manage_team"],
  editor: ["create_content", "edit_content", "review_content", "approve_content"],
  writer: ["create_content", "edit_content"],
  viewer: ["read_content"]
};

const agencyTeamSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Agency ID is required"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "editor", "writer", "viewer"],
      default: "viewer",
    },
    permissions: {
      type: [String],
      default: function() {
        return ROLE_PERMISSIONS[this.role] || ["read_content"];
      }
    },
    status: {
      type: String,
      enum: ["invited", "active", "disabled"],
      default: "invited",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    invitationTokenHash: {
      type: String,
      default: null,
    },
    invitationExpiresAt: {
      type: Date,
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    lastActiveAt: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation error in dev
if (process.env.NODE_ENV === "development" && mongoose.models.AgencyTeam) {
  delete mongoose.models.AgencyTeam;
}

const AgencyTeam = mongoose.models.AgencyTeam || mongoose.model("AgencyTeam", agencyTeamSchema);
export default AgencyTeam;
