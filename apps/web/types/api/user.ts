
export enum UserRole {
  SYSTEM_ADMIN = "system_admin",
  ADMIN = "admin",
  VOLUNTEER = "volunteer",
  MENTOR = "mentor",
  ORGANIZATION = "organization"
}

export enum AuthProvider {
  CREDENTIALS = "credentials",
  GOOGLE = "google",
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  provider: AuthProvider;
  image?: string;
  is_verified: boolean;
  is_blocked: boolean;
  referred_by: string;
  volunteer_profile?: string;
  mentor_profile?: string;
  organization_profile?: string;
  last_seen?: Date;
  expoPushToken?: string;
}
