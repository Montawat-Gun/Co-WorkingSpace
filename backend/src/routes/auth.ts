import express from 'express';

import { register, login, getMe, logout, updateBalance, getCollect } from "../controllers/auth";

const authRouter = express.Router();

import { protect } from "../middleware/auth";

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", protect, getMe);
authRouter.post("/updateBalance", protect, updateBalance);
authRouter.get("/collect", protect, getCollect);
authRouter.get("/logout", logout)

export { authRouter }
