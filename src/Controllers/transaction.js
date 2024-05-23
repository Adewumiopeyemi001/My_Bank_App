import { v4 } from "uuid";
import { errorResMsg } from "../utils/response.utils.js";
import mongoose from "mongoose";
import Transaction from "../Models/transaction.js";
import Account from "../Models/account.model.js";
import User from "../Models/user.model.js";


// export const deposit = async (req, res, next) => {

//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const { transactionType, amount, transactionDescription } = req.body;
//         const transactionReference = v4();
//         const user = req.user;

//         if (!transactionType && !amount && !transactionDescription) {
//             return errorResMsg(res, 400, "Please Input All Fields");
//         }
//         if (!user) {
//             return errorResMsg(res, 400, "User not found");
//         }
//         const depositTransfer = await Promise.all([
//           creditAccount({
//             userName: user.userName,
//             amount,
//             transactionType,
//             transactionReference,
//             summary,
//             trnxSummary: `TRFR To: ${userName}. TRNX REF:${transactionReference} `,
//             session,
//           }),
//         ]);
//          const failedTxns = depositTransfer.filter(
//            (result) => result.status !== true
//          );
//          if (failedTxns.length) {
//            const errors = failedTxns.map((a) => a.message);
//            await session.abortTransaction();
//            return res.status(400).json({
//              status: false,
//              message: errors,
//            });
//          }
//          await session.commitTransaction();
//          session.endSession();

//          return res.status(201).json({
//            status: true,
//            message: "Transfer successful",
//          });
        
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(500).json({
//           status: false,
//           message: `Unable to find perform deposit. Please try again. \n Error: ${error}`,
//         });
//     }
// };

export const deposit = async (req, res, next) => {
  const session = await mongoose.startSession();
    session.startTransaction();
    
     const creditAccount = async ({
       amount,
       transactionType,
       transactionReference,
       summary,
       trnxSummary,
       session,
     }) => {
       try {
         const account = await Account.findOne({ userId: user._id }, null, {
           session,
         });
         if (!account) {
           return { status: false, message: "Account not found" };
         }
         const balanceBefore = account.balance;
         const balanceAfter = balanceBefore + amount;

         const transactionData = {
           accountId: account._id,
           transactionType,
           amount,
           balanceBefore,
           balanceAfter,
           transactionDate: Date.now(),
           transactionStatus: "Approved",
           transactionDescription,
           transactionReference,
           summary,
           trnxSummary,
         };

         const transaction = await Transaction.create([transactionData], {
           session,
         });
         return { status: true, message: "Deposit successful" };
       } catch (error) {
         return { status: false, message: error.message };
       }
     };

  try {
    const { transactionType, amount, transactionDescription } = req.body;
    const transactionReference = v4();
    const user = req.user;

    if (!transactionType && !amount && !transactionDescription) {
      return errorResMsg(res, 400, "Please Input All Fields");
    }
    const existingUser = await User.findOne({ email: user.email });
    if (!existingUser) {
      return res.status(400).json({
        status: false,
        message: "User not found",
      });
    }


    const summary = `Deposit of ${amount} to ${user.userName}`;

    const depositTransfer = await Promise.all([
      creditAccount({
        userName: user.userName,
        amount,
        transactionType,
        transactionReference,
        summary,
        trnxSummary: `TRFR To: ${user.userName}. TRNX REF:${transactionReference} `,
        session,
      }),
    ]);

    const failedTxns = depositTransfer.filter(
      (result) => result.status !== true
    );
    if (failedTxns.length) {
      const errors = failedTxns.map((a) => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: "Transfer successful",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: false,
      message: `Unable to perform deposit. Please try again. \n Error: ${error}`,
    });
  }
};