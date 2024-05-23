import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },
    transactionType: {
        type: String,
        required: true
    },
    amount: {
        type: mongoose.Decimal128,
        required: true,
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    transactionStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },
    transactionDescription: {
        type: String,
        required: true
    },
    transactionReference: {
        type: String,
        required: true
    }
},
    {
        timestamps: true,
        versionKey: false,
    });
    
const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;