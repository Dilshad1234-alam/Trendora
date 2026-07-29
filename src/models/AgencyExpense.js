import mongoose from "mongoose";

const agencyExpenseSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    receiptUrl: {
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV === "development" && mongoose.models.AgencyExpense) {
  delete mongoose.models.AgencyExpense;
}

const AgencyExpense = mongoose.models.AgencyExpense || mongoose.model("AgencyExpense", agencyExpenseSchema);
export default AgencyExpense;
