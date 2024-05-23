import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    transactionType: {
      type: String,
      required: true,
    },
    amount: {
      type: mongoose.Decimal128,
      required: true,
    },
    balanceBefore: {
      type: mongoose.Decimal128,
      required: true,
    },
    balanceAfter: {
      type: mongoose.Decimal128,
      required: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    transactionStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    transactionDescription: {
      type: String,
      required: true,
    },
    transactionReference: {
      type: String,
      required: true,
    },
    summary: { type: String, required: true },
    trnxSummary: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

transactionSchema.post("save", function () {
  // Update the Account model with the new balance
  Account.findByIdAndUpdate(
    this.accountId,
    { $set: { balance: this.balanceAfter } },
    { new: true }
  );
});
    
const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;