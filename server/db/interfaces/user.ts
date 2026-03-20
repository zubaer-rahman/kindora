import { Document } from "mongoose";
import mongoose from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  VOLUNTEER = "volunteer",
  MENTOR = "mentor",
  ORGANIZATION = "organization"
}

export enum AuthProvider {
  CREDENTIALS = "credentials",
  GOOGLE = "google",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  provider: AuthProvider;
  image?: string;
  is_verified: boolean;
  referred_by: string;
  volunteer_profile?: mongoose.Types.ObjectId;
  mentor_profile?: mongoose.Types.ObjectId;
  organization_profile?: mongoose.Types.ObjectId;
  last_seen?: Date;
  expoPushToken?: string;
}
