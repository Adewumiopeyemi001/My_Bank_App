import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value);
      },
      message:
        "Username must contain at least one uppercase letter, one lowercase letter, one digit, and be at least 6 characters long.",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (value) {
        // Custom validator function to check for @ symbol in the email
        return /\S+@\S+\.\S+/.test(value); // This regex checks for @ in the email
      },
      message: "Please enter a valid email address", // Validation error message
    },
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^\d{11}$/.test(value);
      },
      message: "Phone number must be exactly 11 digits.",
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-+?_=,<>/"']).{8,}$/.test(
          value
        );
      },
      message:
        "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long.",
    },
  },
  role: {
    type: Number,
    enum: [1, 2, 3, 4], // 1 = user, 2 = Branch Manager, 3 = Administrator, 4 = Head of Loan
    default: 1,
  },
  profilePicture: {
    type: String,
    default:
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  accountStatus: {
    type: Boolean,
    default: true,
  },
  otp: {
    type: String,
  },
  otpExpiration: {
    type: Date,
  },
  accountType: {
    type: Number,
    enum: [1, 2, 3, 4], // 1 = Savings, 2 = Current, 3 = Loan, 4 = Cooperate
    default: 1,
  },
},
  {
    timestamps: true,
    versionKey: false,
});

userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.SECRET_KEY,
    {
      expiresIn: process.env.EXPIRES_IN, // You can adjust the expiration time
    }
  );
  return token;
};


const User = mongoose.model("User", userSchema);
export default User;