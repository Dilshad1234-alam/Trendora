import mongoose from "mongoose";

const agencyProjectSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgencyClient",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["planning", "active", "on_hold", "completed", "cancelled", "archived"],
      default: "planning",
    },
    budget: {
      type: Number,
      default: 0,
    },
    spent: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    archivedAt: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV === "development" && mongoose.models.AgencyProject) {
  delete mongoose.models.AgencyProject;
}

const AgencyProject = mongoose.models.AgencyProject || mongoose.model("AgencyProject", agencyProjectSchema);
export default AgencyProject;
