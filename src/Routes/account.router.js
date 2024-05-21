import express from "express";
import {createAccount, userProfile} from "../Controllers/account.controller.js"
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/createaccount", auth, createAccount);
router.get("/myprofile", auth, userProfile);

export default router;