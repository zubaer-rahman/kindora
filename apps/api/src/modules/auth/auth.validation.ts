import { z } from "zod";
import { UserRole, AuthProvider } from "@/server/db/interfaces/user";

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z
    .enum([UserRole.ADMIN, UserRole.VOLUNTEER, UserRole.ORGANIZATION, UserRole.MENTOR])
    .default(UserRole.VOLUNTEER),
  provider: z
    .enum([AuthProvider.CREDENTIALS, AuthProvider.GOOGLE])
    .default(AuthProvider.CREDENTIALS),
  referred_by: z.string().optional(),
});

export const authValidation = { signupSchema };
