
import { checkExistingUser, findByToken } from "../services/user.repository.js";
import { errorResMsg, successResMsg } from "../utils/response.utils.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import ejs from "ejs";
import emailSenderTemplate from "../middlewares/email.js";


export const isOtpVerify = async (req, res) => { 
    try {
      const otp = req.query.otp;
      if (!otp) {
        return errorResMsg(res, 400, "Please input your otp");
      }

      const user = await findByToken(otp);
      if (!user) {
        return errorResMsg(res, 400, "User With That Otp Not Found");
      }

      if (otp !== user.otp) {
        return errorResMsg(res, 400, "Invalid Otp");
      }

      // Check if the OTP has expired
      const currentTime = new Date();
      if (user.otpExpiration && currentTime > user.otpExpiration) {
        return res
          .status(400)
          .json({ message: "OTP has expired, please request a new one" });
        }
        
        user.isEmailVerified = true;
        user.otpExpiration = null;
        user.otp = null;

        await user.save();

        return successResMsg(res, 200, {
            success: true,
            message: "OTP Verified successfully"
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

      const now = new Date();
      if (user.otpExpiration && user.otpExpiration > now) {
        return res
          .status(400)
          .json({ message: "Previous OTP has not expired yet" });
      }

      const generateOTP = () => {
        const digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
      };

      // Generate new OTP and update expiration time
      const otp = generateOTP();
      const otpExpiration = new Date();
      otpExpiration.setMinutes(
        otpExpiration.getMinutes() + process.env.OTP_EXPIRATION_TIME_MINUTES
      );
         user.otp = otp;
         user.otpExpiration = otpExpiration;
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