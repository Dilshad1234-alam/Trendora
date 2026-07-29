import mongoose from "mongoose";

const agencyInvoiceSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "paid", "overdue", "cancelled"],
      default: "draft",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    items: [{
      description: String,
      quantity: Number,
      rate: Number,
      amount: Number
    }],
    pdfUrl: {
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV === "development" && mongoose.models.AgencyInvoice) {
  delete mongoose.models.AgencyInvoice;
}

const AgencyInvoice = mongoose.models.AgencyInvoice || mongoose.model("AgencyInvoice", agencyInvoiceSchema);
export default AgencyInvoice;
