import type { NextAuthOptions } from 'next-auth';
import { CredentialsProvider, GoogleProvider } from './providers';

export const authConfig: Partial<NextAuthOptions> = {
  providers: [CredentialsProvider, GoogleProvider],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};
