import express from "express";
import {createAccount, userProfile} from "../Controllers/account.controller.js"
import auth from "../middlewares/auth.js";
import { verifyAccount } from "../Controllers/verifyAccount.js";

const router = express.Router();

router.get("/myprofile", auth, userProfile);
router.post("/createaccount", auth, createAccount);
router.post("/verifyaccount/:id" , auth, verifyAccount);

export default router;