import User from "../Models/user.model.js";
import { checkExistingUser } from "../services/user.repository.js";
import { errorResMsg, successResMsg } from "../utils/response.utils.js";
import emailSenderTemplate from "../middlewares/email.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import ejs from "ejs";


export const register = async (req, res) => { 
    try {
      const { firstName, lastName, userName, email, password, phoneNumber } =
        req.body;
      if (
        !firstName ||
        !lastName ||
        !userName ||
        !email ||
        !password ||
        !phoneNumber
      ) {
        return errorResMsg(res, 400, "Please fill all the fields");
      }
      const existingUser = await checkExistingUser(email);
      if (existingUser) {
        return errorResMsg(res, 400, "User already exists");
      }

      // Generate OTP
      const generateOTP = () => {
        const digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
      };

      const otp = generateOTP();

      const otpExpiration = new Date();
      otpExpiration.setMinutes(
        otpExpiration.getMinutes() + process.env.OTP_EXPIRATION_TIME_MINUTES
      ); // Set expiration time
      const newUser = await User.create({
        firstName,
        lastName,
        userName,
        email,
        password,
        phoneNumber,
        otp,
        otpExpiration,
      });

      const currentFilePath = fileURLToPath(import.meta.url);
      const currentDir = dirname(currentFilePath);
      const templatePath = path.join(
        currentDir,
        "../Public/emails/register.ejs"
      );

      await ejs.renderFile(
        templatePath,
        {
          title: `Hi ${firstName}`,
          body: "Welcome",
          otp: otp,
        },
        async (err, data) => {
          await emailSenderTemplate(
            data,
            "Verify Your Email - MyBankApp Account Confirmation",
            email
          );
        }
      );

      return successResMsg(res, 201, {
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error) {
         console.error(error);
         return errorResMsg(res, 500, {
           error: error.message,
           message: "Internal Server Error",
         });
    }
};