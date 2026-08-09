import { auth } from "@/auth";
import mongoose from "mongoose";
import connectDB from "./mongoose";
import { verifyAccessToken } from "../modules/auth/mobile-token";

export const createContext = async (opts?: {
  headers?: Record<string, string>;
}) => {
  const session = await auth();

  // Support for mobile apps: check for Authorization header
  let mobileUser = null;
  if (opts?.headers?.authorization) {
    const authHeader = opts.headers.authorization;
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    const decoded = verifyAccessToken(token);
    if (decoded) {
      mobileUser = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }
  }

  await connectDB();

  // Prefer session (from NextAuth) over mobile token, but support both
  const user = session?.user || mobileUser;

  return {
    user: user || null,
    session: session || null,
    headers: opts?.headers,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
