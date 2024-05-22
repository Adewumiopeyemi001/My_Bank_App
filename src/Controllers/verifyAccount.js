import Account from "../Models/account.model.js"; // adjust the import as needed
import { errorResMsg, successResMsg } from "../utils/response.utils.js";

export const verifyAccount = async (req, res) => {
  try {
    const user = req.user;
    const accountId = req.params.id;
    // console.log(accountId);
    const account = await Account.findById(accountId);
    if (!user) {
      return errorResMsg(res, 400, "User not found");
    }

    if (!account) {
      return errorResMsg(res, 400, "Account not found");
    }

    const {
      bvn,
      nin,
      utilityBill,
      officeAddress,
      letterHeadedPaper,
    } = req.body;

    let isVerified = false;

    if (account.accountType === "savings" && bvn && nin) {
      isVerified = true;
    } else if (account.accountType === "current" && bvn && nin && utilityBill) {
      isVerified = true;
    } else if (
      account.accountType === "cooperate" &&
      bvn &&
      nin &&
      utilityBill &&
      officeAddress &&
      letterHeadedPaper
    ) {
      isVerified = true;
    }

    if (isVerified) {
      account.accountStatus = "Verified";
      account.isAccountVerified = true;
      await account.save();
    }
    return successResMsg(res, 200, {
      success: true,
      data: account,
      message: "Account verified successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: "Internal Server Error",
    });
  }
};
