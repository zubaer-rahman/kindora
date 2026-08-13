import { Request, Response, NextFunction } from "express";
import { UserRole } from "../db/interfaces/user.js";
import { AuthRequest } from "./auth.js";

const allowedRoles = (req: AuthRequest, ...roles: UserRole[]) => {
  if (!req.user) return false;
  return roles.includes(req.user.role);
};

export const requireVolunteer = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!allowedRoles(req, UserRole.VOLUNTEER)) {
    return res.status(403).json({ success: false, message: "Volunteer access required." });
  }
  next();
};

export const requireMentor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!allowedRoles(req, UserRole.MENTOR)) {
    return res.status(403).json({ success: false, message: "Mentor access required." });
  }
  next();
};

export const requireOrg = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!allowedRoles(req, UserRole.ORGANIZATION, UserRole.ADMIN)) {
    return res.status(403).json({ success: false, message: "Organisation access required." });
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!allowedRoles(req, UserRole.ADMIN)) {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }
  next();
};

export const requireSystemAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!allowedRoles(req, UserRole.SYSTEM_ADMIN)) {
    return res.status(403).json({ success: false, message: "System admin access required." });
  }
  next();
};

export const allowRoles =
  (...roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!allowedRoles(req, ...roles)) {
      return res.status(403).json({ success: false, message: "Access denied for your role." });
    }
    next();
  };
