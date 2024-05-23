import express from "express";
import {
  createAccount,
  getAccountDetails,
  getUserProfile,
} from "../Controllers/account.controller.js";
import auth from "../middlewares/auth.js";
import { verifyAccount } from "../Controllers/verifyAccount.js";

const router = express.Router();

router.get("/myprofile", auth, getUserProfile);
router.post("/createaccount", auth, createAccount);
router.post("/verifyaccount/:id" , auth, verifyAccount);
router.get("/getaccountdetails", auth, getAccountDetails);

export default router;