import express from "express";
import { register, login } from "../Controllers/user.controller.js";
import { isOtpVerify, resendOtp } from "../Controllers/otpVerification.js";
import { forgetPassword, resetPassword } from "../Controllers/userPassword.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verifyotp", isOtpVerify);
router.post("/resendotp", resendOtp);
router.post("/forgotpassword", forgetPassword);
router.post("/resetpassword/:token", resetPassword);


export default router;
