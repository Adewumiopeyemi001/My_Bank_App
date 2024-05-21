import User from "../Models/user.model.js";
import { checkExistingPassword, checkExistingUser, checkExistingUserByUsername } from "../services/user.repository.js";
import { errorResMsg, successResMsg } from "../utils/response.utils.js";
import emailSenderTemplate from "../middlewares/email.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import ejs from "ejs";
import generateOTP from "../utils/otpGenerator.js";
import otpStore from "../utils/otpStore.js";



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

      const otp = generateOTP();
      otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };

      const newUser = await User.create({
        firstName,
        lastName,
        userName,
        email,
        password,
        phoneNumber,
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
        message: "User registered successfully. Please check your email for the OTP.",
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

export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body; // emailOrUsername can be either email or username
    if (!emailOrUsername || !password) {
      return errorResMsg(
        res,
        400,
        "Please enter your email/username and password"
      );
    }

    // Determine if the emailOrUsername is an email or username
    const isEmail = emailOrUsername.includes("@");
    let user;

    if (isEmail) {
      user = await checkExistingUser(emailOrUsername);
    } else {
      user = await checkExistingUserByUsername(emailOrUsername);
    }

    if (!user) {
      return errorResMsg(res, 400, "User not found");
    }

    const passwordMatch = await checkExistingPassword(password, user);
    if (!passwordMatch) {
      return errorResMsg(res, 400, "Password does not match");
    }

    const token = user.generateAuthToken();


    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFilePath);
    const templatePath = path.join(currentDir, "../Public/emails/login.ejs");

    await ejs.renderFile(
      templatePath,
      {
        title: `Hello ${user.userName},`,
        body: "You Just login In",
        userName: user.userName,
      },
      async (err, data) => {
        await emailSenderTemplate(
          data,
          "Login Detected",
          user.email
        );
      }
    );

    return successResMsg(res, 200, {
      success: true,
      message: "User Logged in Successfully",
      data: token,
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: "Internal Server Error",
    });
  }
};