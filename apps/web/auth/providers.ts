import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import User from "@/server/db/models/user";
import { ApiError } from "@/lib/exceptions";
import httpStatus from "http-status";
import { errorHandler } from "@/server/middlewares/error-handler";
import connectDB from "@/server/config/mongoose";
import { UserRole } from "@/server/db/interfaces/user";
import { generateTokenAndSendMail } from "@/utils/helpers/generateToken";
import VolunteerProfile from "@/server/db/models/volunteer-profile";
import MentorProfile from "@/server/db/models/mentor-profile";
import OrganizationProfile from "@/server/db/models/organization-profile";

export const CredentialsProvider = Credentials({
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
    action: { label: "Action", type: "text" },
    name: { label: "Name", type: "text" },
    referred_by: { label: "Referred By", type: "text" },
    role: { label: "Role", type: "text" },
  },
  async authorize(credentials) {
    try {

      if (!credentials?.email || !credentials?.password) {
        throw new Error("Invalid credentials");
      }
      await connectDB();
      const user = await User.findOne({ email: credentials.email });

      if (credentials?.action === "signin") {
        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "User not found. Please sign up first.");
        }

        if (!user?.is_verified) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Please verify your email first!");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password. Please try again.");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          // Filter out base64 images here to prevent large headers
          image: (typeof user.image === 'string' && user.image.startsWith('data:')) ? null : user.image,
          message: "Logged in successfully"
        };
      }

      if (credentials?.action === "signup") {
        if (user) {
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (isPasswordCorrect) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
              message: "Logged in successfully"
            };
          }
          throw new ApiError(httpStatus.CONFLICT, "User already exists with different password");
        }

        const hashedPassword = await bcrypt.hash(credentials.password as string, 10);
        const role = (credentials.role || UserRole.VOLUNTEER) as UserRole;

        const newUser = new User({
          email: credentials.email,
          name: credentials.name,
          password: hashedPassword,
          referred_by: credentials.referred_by,
          role: role,
          is_verified: false, // require email verification before they can log in
        });

        // Create profile based on role
        if (role === UserRole.VOLUNTEER) {
          const profile = await VolunteerProfile.create({
            interested_on: ["General Support"],
            phone_number: "+61",
            referral_source: "Other",
            is_currently_studying: "yes",
            non_student_type: "general_public"
          });
          newUser.volunteer_profile = profile._id;
        } else if (role === UserRole.MENTOR) {
          const profile = await MentorProfile.create({
            interested_on: ["Mentoring"],
            phone_number: "+61",
            referral_source: "Other",
            is_currently_studying: "yes",
            non_student_type: "general_public"
          });
          newUser.mentor_profile = profile._id;
        } else if (role === UserRole.ADMIN || role === UserRole.ORGANIZATION) {
          const profile = await OrganizationProfile.create({
            title: credentials.name,
            type: "nonprofit",
            opportunity_types: ["General Support"],
            required_skills: ["General"]
          });
          newUser.organization_profile = profile._id;
        }

        await newUser.save();

        // Send verification email (don't block signup if email fails)
        try {
          await generateTokenAndSendMail(newUser, "Verify Email");
        } catch (err) {
          console.error("[Credentials] Verification email failed:", err);
        }

        // Don't create a session – user must verify email first. Throw so client can show message and redirect to login.
        throw new ApiError(
          httpStatus.OK,
          "Registration successful. Please check your email to verify your account. You can sign in after verifying."
        );
      }

      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid action specified");
    } catch (error) {
      const { message } = errorHandler(error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, message);
    }
  },
});

export const GoogleProvider = Google({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
});