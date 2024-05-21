
import { checkExistingUser } from "../services/user.repository.js";
import { errorResMsg, successResMsg } from "../utils/response.utils.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import ejs from "ejs";
import emailSenderTemplate from "../middlewares/email.js";
import otpStore from "../utils/otpStore.js";
import generateOTP from "../utils/otpGenerator.js";


const OTP_EXPIRATION_TIME_MINUTES = 10;

export const isOtpVerify = async (req, res) => { 
    try {
      const { otp, email } = req.query;

      if (!otp || !email) {
        return errorResMsg(res, 400, "Please input your OTP and email");
      }

      const storedOtpData = otpStore[email];
      if (!storedOtpData) {
        return errorResMsg(res, 400, "OTP has expired or is invalid");
      }

      const { otp: storedOtp, expires } = storedOtpData;
      if (Date.now() > expires) {
        delete otpStore[email]; // Remove expired OTP
        return errorResMsg(res, 400, "OTP has expired");
      }

      if (storedOtp !== otp) {
        return errorResMsg(res, 400, "Invalid OTP");
      }

      const user = await checkExistingUser(email);
      if (!user) {
        return errorResMsg(res, 400, "User with that email not found");
      }
    
      user.isEmailVerified = true;

      await user.save();

      delete otpStore[email]; // Clean up OTP store after successful verification

      return successResMsg(res, 200, {
        success: true,
        message: "OTP Verified successfully",
      });
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, {
            error: error.message,
            message: "Internal Server Error"
        });
    }
};

export const resendOtp = async(req, res) => { 
    try {
      const { email } = req.body;
      if (!email) {
        return errorResMsg(res, 400, "Please input your email");
      }
      const user = await checkExistingUser(email);
      if (!user) {
        return errorResMsg(res, 400, "User With That Email Not Found");
      }

        const storedOtpData = otpStore[email];
        if (storedOtpData && Date.now() < storedOtpData.expires) {
          return res
            .status(400)
            .json({ message: "Previous OTP has not expired yet" });
        }

      // Generate new OTP and update expiration time
      const otp = generateOTP();
      const otpExpiration = new Date();
      otpExpiration.setMinutes(
        otpExpiration.getMinutes() + OTP_EXPIRATION_TIME_MINUTES
      );

      otpStore[email] = { otp, expires: otpExpiration.getTime() };

         user.isEmailVerified = false;
        await user.save();

        const currentFilePath = fileURLToPath(import.meta.url);
        const currentDir = dirname(currentFilePath);
        const templatePath = path.join(
          currentDir,
          "../Public/emails/resendOtp.ejs"
        );
        await ejs.renderFile(
          templatePath,
          {
            title: `Hi ${user.userName}`,
              otp: otp,
            userName: user.userName,
          },
          async (err, data) => {
            await emailSenderTemplate(
              data,
              "Resend OTP - Verify Your Account",
              email
            );
          }
        );
        
        return successResMsg(res, 201, {
          success: true,
          message: "New OTP sent successfully"
        });
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, {
            error: error.message,
            message: "Internal Server Error"
        });
        
    }
};