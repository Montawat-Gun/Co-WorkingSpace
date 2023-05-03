import express from 'express';

import { register, login, getMe, logout, updateBalance } from "../controllers/auth";

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/updateBalance", protect, updateBalance);
router.get("/logout", logout)

export { router as authRouter }
