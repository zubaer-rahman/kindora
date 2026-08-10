import { Response } from "express";
import { catchAsync, sendResponse } from "../lib/http.js";
import { AuthRequest } from "../middleware/auth.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";

export const register = catchAsync(async (req, res: Response) => {
  const body = registerSchema.parse(req.body);
  const result = await authService.register(body);
  sendResponse(res, 201, result, "Account created successfully.");
});

export const login = catchAsync(async (req, res: Response) => {
  const body = loginSchema.parse(req.body);
  const result = await authService.login(body);
  sendResponse(res, 200, result, "Login successful.");
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  sendResponse(res, 200, user);
});
