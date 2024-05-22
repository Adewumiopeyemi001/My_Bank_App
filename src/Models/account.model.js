import mongoose from "mongoose";


const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountNumber: {
      type: String,
      unique: true,
    },
    balance: {
      type: mongoose.Decimal128,
      default: 0,
    },
    accountType: {
      type: String,
      required: true,
      enum: ["savings", "current", "cooperate"],
    },
    accountStatus: {
      type: String,
      enum: ["Pending", "Verified", "Closed", "Suspended"],
      default: "Pending",
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    // Verification documents
    bvn: {
      type: String,
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^\d{11}$/.test(value);
        },
        message: "BVN must be exactly 11 digits.",
      },
    },
    nin: {
      type: String,
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^\d{11}$/.test(value);
        },
        message: "NIN must be exactly 11 digits.",
      },
    },
    utilityBill: {
      type: String,
    },
    officeAddress: {
      type: String,
    },
    letterHeadedPaper: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
  
    // Function to generate a random 10-digit number
function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000)
    .toString()
    .substring(0, 10);
}

// Pre-save hook to generate a unique account number
accountSchema.pre("save", async function (next) {
  if (!this.accountNumber) {
    let generatedNumber;
    let isUnique = false;
    while (!isUnique) {
      generatedNumber = generateAccountNumber();
      const existingUser = await mongoose
        .model("User")
        .findOne({ accountNumber: generatedNumber });
      if (!existingUser) {
        isUnique = true;
      }
    }
    this.accountNumber = generatedNumber;
  }
  next();
});

const Account = mongoose.model("Account", accountSchema);
export default Account;