import express from "express";
import auth from "../middlewares/auth.js";

import { deposit } from "../Controllers/transaction.js";


const router = express.Router();

router.post("/deposit", auth, deposit);


export default router;