import express from "express";
import { register, login } from "../Controllers/user.controller.js";
import { isOtpVerify, resendOtp } from "../Controllers/otpVerification.js";
import { forgetPassword, resetPassword } from "../Controllers/userPassword.js";
import { uploadPicture } from "../Controllers/userMedias.js";
import upload from "../Public/images/multer.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put(
  "/profilepicture/:id",
  upload.single("profilePicture"),
  uploadPicture
);
router.post("/verifyotp", isOtpVerify);
router.post("/resendotp", resendOtp);
router.post("/forgotpassword", forgetPassword);
router.post("/resetpassword/:token", resetPassword);


export default router;
