import Account from "../Models/account.model.js";
import { errorResMsg, successResMsg } from "../utils/response.utils.js";


export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return errorResMsg(res, 400, "User not found");
    }

      const account = await Account.findOne({ userId: user._id });
      const userProfile = {
        user,
        account,
      };

    return successResMsg(res, 200, {
      success: true,
      data: userProfile,
      message: "User profile retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: "Internal Server Error",
    });
  }
};

export const createAccount = async (req, res) => {
  try {
    const user = req.user;
    const { accountType } = req.body;
    if (!accountType) {
      return errorResMsg(res, 400, "Please select account type");
    }
    if (!user) {
      return errorResMsg(res, 400, "User not found");
    }
    // Check if the user already has an account
    const existingAccount = await Account.findOne({ userId: user._id });
    if (existingAccount) {
      return errorResMsg(res, 400, "You already have an account");
    }
    const account = await Account.create({
      accountType,
      userId: user._id,
    });

    return successResMsg(res, 201, {
      success: true,
      data: account,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: "Internal Server Error",
    });
  }
};

export const getAccountDetails = async (req, res) => {
  const user = req.user;
  if (!user) {
    return errorResMsg(res, 400, "User not found");
  }
  const account = await Account.findOne({ userId: user._id });
  if (!account) {
    return errorResMsg(res, 400, "Account not found");
  }
  const accountDetails = {
    accountNumber: account.accountNumber,
    balance: account.balance,
    accountType: account.accountType,
    accountStatus: account.accountStatus,
    createdOn: account.createdOn,
  };
  return successResMsg(res, 200, {
    success: true,
    data: accountDetails,
    message: "Account details retrieved successfully",
  });
};