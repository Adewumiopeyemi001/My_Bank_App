import express from "express";
import { register } from "../Controllers/user.controller.js";
import { isOtpVerify, resendOtp } from "../Controllers/otpVerification.js";

const router = express.Router();

router.post("/register", register);
router.post("/verifyotp", isOtpVerify);
router.post("/resendotp", resendOtp);


export default router;
