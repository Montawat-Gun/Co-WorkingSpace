import express from 'express';

import { register, login, getMe, logout } from "../controllers/auth";

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", logout)

export { router as authRouter }
