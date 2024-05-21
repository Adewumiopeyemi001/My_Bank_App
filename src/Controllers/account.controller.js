import Account from "../Models/account.model.js";
import User from "../Models/user.model.js";
import { errorResMsg, successResMsg } from "../utils/response.utils.js";


export const userProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return errorResMsg(res, 400, "User not found");
    }
    const profile = await User.findById(user._id).populate({
      path: "accountId",
      model: "Account",
      });

    return successResMsg(res, 200, {
      success: true,
      data: profile,
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
      const account = await Account.create({
        accountType,
        userId: user._id,
      });

      // Populate the userId field with the entire user document
      const populatedAccount = await account.populate("userId");

      // Save the populated document to the database
      await populatedAccount.save();

      return successResMsg(res, 201, {
        success: true,
        data: populatedAccount,
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