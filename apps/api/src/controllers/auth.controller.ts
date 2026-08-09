import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../db/models/user';
import { UserRole, AuthProvider, IUser } from '../db/interfaces/user';
import { catchAsync, sendResponse } from '../lib/utils';
import { AuthRequest } from '../middleware/auth';

const secret = () => process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!;

const generateToken = (payload: { id: string; email: string; role: UserRole }, expiresIn = '7d') =>
  jwt.sign(payload, secret(), { expiresIn } as jwt.SignOptions);

// Validation Schemas
const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).default(UserRole.VOLUNTEER),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * POST /api/v1/auth/register
 */
export const register = catchAsync(async (req, res: Response) => {
  const body = signupSchema.parse(req.body);

  const existingUser = await User.findOne({ email: body.email });
  if (existingUser) {
    res.status(409).json({ success: false, message: 'Email already registered.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);
  const user = await User.create({
    name: body.name,
    email: body.email,
    password: hashedPassword,
    role: body.role,
    provider: AuthProvider.CREDENTIALS,
    is_verified: false,
  });

  const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });

  sendResponse(res, 201, {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  }, 'Account created successfully.');
});

/**
 * POST /api/v1/auth/login
 */
export const login = catchAsync(async (req, res: Response) => {
  const body = loginSchema.parse(req.body);

  const user = await User.findOne({ email: body.email }).select('+password');
  if (!user || !user.password) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  const isMatch = await bcrypt.compare(body.password, user.password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });

  sendResponse(res, 200, {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, image: user.image },
  }, 'Login successful.');
});

/**
 * GET /api/v1/auth/me
 */
export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).select('-password');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }
  sendResponse(res, 200, user);
});
