import { AuthError } from "@/lib/exceptions";
import { errorHandler } from "./error-handler";
import { middleware, publicProcedure } from "../trpc";
import { verifyAccessToken } from "../modules/auth/mobile-token";

type User = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
} | null;

type Context = {
  user?: User | null;
  headers?: Record<string, string>;
};

import { TRPCError } from "@trpc/server";



const withAuth = middleware(async ({ ctx, next, path }) => {
  const contextWithSession = ctx as Context;

  try {
    let user = contextWithSession.user;

    // If no session user, try to extract from Authorization header (mobile apps)
    if (!user && contextWithSession.headers?.authorization) {
      const authHeader = contextWithSession.headers.authorization;
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

      const decoded = verifyAccessToken(token);
      if (decoded) {
        user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        };
      }
    }

    if (!user || !user.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource.",
      });
    }

    // Add role check using the TRPC path instead of req.url
    const userRole = user.role;

    // Check if user is accessing their role-specific routes
    if (path.includes('volunteer.') && userRole !== 'volunteer') {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied. Volunteer access only.",
      });
    }

    if (path.includes('organization.') && userRole !== 'admin' && userRole !== 'mentor') {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied. Admin or Mentor access only.",
      });
    }

    return next({
      ctx: {
        ...contextWithSession,
        user,
        session: contextWithSession.user,
      },
    });
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    const { message } = errorHandler(error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message,
    });
  }
});

export const protectedProcedure = publicProcedure.use(withAuth);
