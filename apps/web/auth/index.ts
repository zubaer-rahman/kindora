import NextAuth from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./options";

// Register models
import "@/server/db/models";

const handler = NextAuth(authOptions);

export default handler;

// Helper function for server-side auth (compatible with v4)
export async function auth() {
  return await getServerSession(authOptions);
}

// Export signIn and signOut from next-auth/react for client-side use
export { signIn, signOut } from "next-auth/react";
