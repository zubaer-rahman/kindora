import { AUTH_PATHS, PROTECTED_PATHS } from "@/utils/constants/navigation";

/**
 * Checks if the given path is an authentication path (login, signup, reset-password)
 * @param path - The path string to check
 * @returns true if the path is an auth path, false otherwise
 */
export function isAuthPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return AUTH_PATHS.some((authPath) => 
    path === authPath || path.startsWith(authPath + "/")
  );
}

/**
 * Checks if the given path is a protected path (requires authentication)
 * @param path - The path string to check
 * @returns true if the path is a protected path, false otherwise
 */
export function isProtectedPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return PROTECTED_PATHS.some((protectedPath) => 
    path === protectedPath || path.startsWith(protectedPath + "/")
  );
}

/**
 * Checks if the given path is the reset password path
 * @param path - The path string to check
 * @returns true if the path ends with "reset-password", false otherwise
 */
export function isResetPasswordPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return path.endsWith("reset-password");
}

