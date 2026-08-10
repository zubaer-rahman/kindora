import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../db/models/user.js";
import { UserRole, AuthProvider } from "../db/interfaces/user.js";
import env from "../config/env.js";
import { RegisterInput, LoginInput } from "../validators/auth.validator.js";

const getJwtSecret = () => env.jwt_secret || env.nextauth_secret!;

const generateToken = (
  payload: { id: string; email: string; role: UserRole },
  expiresIn = "7d",
) => jwt.sign(payload, getJwtSecret(), { expiresIn } as jwt.SignOptions);

export async function register(body: RegisterInput) {
  const existingUser = await User.findOne({ email: body.email });
  if (existingUser) {
    const err: any = new Error("Email already registered.");
    err.statusCode = 409;
    throw err;
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

  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}

export async function login(body: LoginInput) {
  const user = await User.findOne({ email: body.email }).select("+password");
  if (!user || !user.password) {
    const err: any = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(body.password, user.password);
  if (!isMatch) {
    const err: any = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    },
  };
}

export async function getMe(userId: string) {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const err: any = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }
  return user;
}
