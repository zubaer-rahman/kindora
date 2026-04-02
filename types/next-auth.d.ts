/* eslint-disable @typescript-eslint/no-unused-vars */
import type { JWT } from "next-auth/jwt"; // Necessary for type augmentation

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string | null;
    organization_profile?: {
      _id: string;
      title: string;
      type?: string;
      contact_email?: string;
      phone_number?: string;
      bio?: string;
      state?: string;
      area?: string;
      abn?: string;
      website?: string;
      profile_img?: string;
      cover_img?: string;
      opportunity_types?: string[];
      required_skills?: string[];
    };
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string;
    organization_profile?: {
      _id: string;
      title: string;
      type?: string;
      contact_email?: string;
      phone_number?: string;
      bio?: string;
      state?: string;
      area?: string;
      abn?: string;
      website?: string;
      profile_img?: string;
      cover_img?: string;
      opportunity_types?: string[];
      required_skills?: string[];
    };
  }
}
