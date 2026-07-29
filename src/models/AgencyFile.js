import mongoose from "mongoose";

const agencyFileSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgencyProject",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    folder: {
      type: String,
      default: "/",
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "document", "other"],
      default: "other",
    },
    size: {
      type: Number, // in bytes
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV === "development" && mongoose.models.AgencyFile) {
  delete mongoose.models.AgencyFile;
}

const AgencyFile = mongoose.models.AgencyFile || mongoose.model("AgencyFile", agencyFileSchema);
export default AgencyFile;
