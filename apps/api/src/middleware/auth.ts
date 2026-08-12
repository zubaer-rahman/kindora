import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../db/interfaces/user.js";
import env from "../config/env.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided." });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const secret = env.jwt_secret || env.nextauth_secret!;
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: UserRole;
    };
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch {
    res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized: Invalid or expired token.",
      });
  }
};
