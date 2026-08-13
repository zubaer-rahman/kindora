import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../db/models/user.js";
import VolunteerProfile from "../db/models/volunteer-profile.js";
import MentorProfile from "../db/models/mentor-profile.js";
import OrganizationProfile from "../db/models/organization-profile.js";
import { UserRole, AuthProvider } from "../db/interfaces/user.js";
import env from "../config/env.js";
import { generateTokenAndSendMail } from "../lib/mail/generateToken.js";
import { RegisterInput, LoginInput } from "../validators/auth.validator.js";

const getJwtSecret = () => env.jwt_secret || env.nextauth_secret!;

const generateToken = (
  payload: { id: string; email: string; role: UserRole },
  expiresIn = "7d",
) => jwt.sign(payload, getJwtSecret(), { expiresIn } as jwt.SignOptions);

export async function checkEmail(email: string) {
  const existingUser = await User.findOne({ email });
  return { isTaken: !!existingUser };
}

export const EMAIL_ALREADY_REGISTERED = "EMAIL_ALREADY_REGISTERED";
export const SIGNUP_SUCCESS_UNVERIFIED = "SIGNUP_SUCCESS_UNVERIFIED";

export async function register(body: RegisterInput) {
  const existingUser = await User.findOne({ email: body.email });
  if (existingUser) {
    const err: any = new Error("Email already registered.");
    err.statusCode = 409;
    err.code = EMAIL_ALREADY_REGISTERED;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);
  const role = body.role || UserRole.VOLUNTEER;

  const user = new User({
    name: body.name,
    email: body.email,
    password: hashedPassword,
    referred_by: body.referred_by,
    role,
    provider: AuthProvider.CREDENTIALS,
    is_verified: false,
  });

  if (role === UserRole.VOLUNTEER) {
    const profile = await VolunteerProfile.create({
      interested_on: ["General Support"],
      phone_number: "+61",
      referral_source: "Other",
      is_currently_studying: "yes",
      non_student_type: "general_public",
    });
    user.volunteer_profile = profile._id;
  } else if (role === UserRole.MENTOR) {
    const profile = await MentorProfile.create({
      interested_on: ["Mentoring"],
      phone_number: "+61",
      referral_source: "Other",
      is_currently_studying: "yes",
      non_student_type: "general_public",
    });
    user.mentor_profile = profile._id;
  } else if (role === UserRole.ADMIN || role === UserRole.ORGANIZATION) {
    const profile = await OrganizationProfile.create({
      title: body.name,
      type: "nonprofit",
      opportunity_types: ["General Support"],
      required_skills: ["General"],
    });
    user.organization_profile = profile._id;
  }

  await user.save();

  try {
    await generateTokenAndSendMail(user, "Verify Email");
  } catch (err) {
    console.error("[Auth] Verification email failed:", err);
  }

  return {
    code: SIGNUP_SUCCESS_UNVERIFIED,
    message:
      "Registration successful. Please check your email to verify your account. You can sign in after verifying.",
  };
}

export async function login(body: LoginInput) {
  const user = await User.findOne({ email: body.email })
    .select("+password")
    .populate("organization_profile")
    .populate("volunteer_profile");
  if (!user || !user.password) {
    const err: any = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  if (!user.is_verified) {
    const err: any = new Error("Please verify your email first!");
    err.statusCode = 400;
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
      organization_profile: user.organization_profile,
      volunteer_profile: user.volunteer_profile,
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
