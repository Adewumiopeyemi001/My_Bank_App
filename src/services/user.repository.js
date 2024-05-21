
import User from "../Models/user.model.js"
import bcrypt from "bcryptjs";

export const checkExistingUser = async (email) => {
  return User.findOne({ email });
};
export const checkExistingUserByUsername = async (userName) => {
  return User.findOne({ userName });
};
export const findByOtp = async (otp) => {
  return User.findOne({ otp });
};

export const findUserById = async (id) => {
  return User.findById(id);
};

export const checkExistingPassword = async (password, user) => {
  return bcrypt.compare(password, user.password);
};

export const checkExistingUserToken = async ({ resetPasswordToken: token }) => {
  return User.findOne({ resetPasswordToken: token });
};

