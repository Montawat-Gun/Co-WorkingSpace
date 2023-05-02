import { NextFunction, Request, Response } from 'express';
import { IUser, User } from "../models/User";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userEntity: IUser = req.body;

    const user = await User.create(userEntity);

    const token = user.getSignedJwtToken();
    const cookieOptions = getCookieOption();

    return res.status(200).cookie("token", token, cookieOptions).json({ success: true, token: token });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
    console.log(err.stack);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: true, message: "Please provide an email and password" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentails" });
  }

  const token = user.getSignedJwtToken();
  const cookieOptions = getCookieOption();
  return res.status(200).cookie("token", token, cookieOptions).json({
    success: true,
    //add for frontend
    _id: user._id,
    name: user.name,
    email: user.email,
    //end for frontend,
    token,
  });
};

export const getCookieOption = () => {
  const options = {
    expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  return options;
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.body.user.id);
  res.status(200).json({ success: true, data: user });
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
};