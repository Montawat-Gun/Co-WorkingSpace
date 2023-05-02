import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { NextFunction, Request, Response } from 'express';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token || token == "null") {
    return res.status(401).json({ success: false, message: "Not authorize to access this route" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.body.user = await User.findById((decoded as jwt.JwtPayload).id);

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorize to access this route" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.body.user.role)) {
      return res.status(403).json({ success: false, message: `User role ${req.body.user.role} is not authorized to access this route` });
    }
    next();
  };
};
