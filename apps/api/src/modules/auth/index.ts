import httpStatus from 'http-status';
import { z } from 'zod'; // Import Zod for validation
import User from '@/server/db/models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Import JWT for token generation
import { authValidation } from './auth.validation';
import { generateTokenAndSendMail } from '@/utils/helpers/generateToken';
import { ApiError } from '@/lib/exceptions';
import { publicProcedure, router } from '@/server/trpc';
import { protectedProcedure } from '@/server/middlewares/with-auth';
import mongoose from 'mongoose';
import { presenceService } from '@/server/services/presence';
import { JwtPayload } from 'jsonwebtoken';
import { createMobileTokens, verifyRefreshToken } from './mobile-token';
import { TRPCError } from '@trpc/server';
import { UserRole } from '@/server/db/interfaces/user';
import VolunteerProfile from '@/server/db/models/volunteer-profile';
import MentorProfile from '@/server/db/models/mentor-profile';
import OrganizationProfile from '@/server/db/models/organization-profile';

export const authRouter = router({
  checkEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const user = await User.findOne({ email: input.email });
      return { exists: !!user };
    }),
  signup: publicProcedure
    .input(authValidation.signupSchema)
    .mutation(async ({ input }) => {
      const { email, password, name, role, provider, referred_by } = input;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError(httpStatus.CONFLICT, 'User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        email,
        password: hashedPassword,
        name,
        role,
        provider,
        referred_by: referred_by ? new mongoose.Types.ObjectId(referred_by) : undefined,
        is_verified: false, // require email verification before login
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
          title: name,
          type: "nonprofit",
          opportunity_types: ["General Support"],
          required_skills: ["General"]
        });
        newUser.organization_profile = profile._id;
      }

      await newUser.save();

      await generateTokenAndSendMail(
        newUser,
        'Verify Email' // any string !== 'Password Reset' uses verify_email template
      );

      return {
        message: 'User registered successfully, please verify your email.',
        status: httpStatus.OK,
        user: newUser,
      };
    }),
  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { email } = input;

      const user = await User.findOne({ email: email });
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      await generateTokenAndSendMail(user, 'Password Reset');
      return {
        message:
          'Password reset link has been sent to your email. Please check.',
        status: 200,
      };
    }),
  verifyEmail: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { token } = input;

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };

      const user = await User.findById(decoded.id);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      if (user.is_verified) {
        return {
          message: 'User is already verified.',
          alreadyVerified: true,
          status: 200,
        };
      }

      user.is_verified = true;
      await user.save();

      return {
        message: 'Email verified successfully.',
        status: 200,
        alreadyVerified: false,
        data: user,
      };
    }),
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { token, password } = input;

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
          id: string;
        };
      } catch (error) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          `Invalid or expired token:${error}`
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const updatedUser = await User.findByIdAndUpdate(
        decoded.id,
        { password: hashedPassword },
        { new: true }
      );

      if (!updatedUser) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      return {
        message: 'Password has been changed successfully',
        status: 200,
        data: updatedUser,
      };
    }),
  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      const sessionUser = ctx.user as JwtPayload;
      // DISABLED: heartbeat/presence - re-enable when we have paid servers
      // if (sessionUser?.id) {
      //   await presenceService.clearUserPresence(sessionUser.id);
      // }
      return {
        message: 'Logged out successfully',
        status: 200,
      };
    }),

  /**
   * MOBILE-SPECIFIC ENDPOINTS
   * These endpoints are designed for mobile apps (Expo/React Native)
   * They return JSON tokens instead of relying on cookies
   */

  /**
   * Mobile login endpoint
   * Returns both access and refresh tokens
   */
  mobileLogin: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password } = input;

      const user = await User.findOne({ email });
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found. Please sign up first.');
      }

      if (!user.is_verified) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Please verify your email first!');
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password. Please try again.');
      }

      const tokens = await createMobileTokens(user._id.toString());

      return {
        message: 'Logged in successfully',
        status: httpStatus.OK,
        data: {
          ...tokens,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          },
        },
      };
    }),

  /**
   * Mobile signup endpoint
   * Returns both access and refresh tokens upon successful registration
   */
  mobileSignup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string(),
        role: z.enum(['volunteer', 'admin', 'mentor', 'organization']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password, name, role } = input;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError(httpStatus.CONFLICT, 'User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        email,
        password: hashedPassword,
        name,
        role: role || 'volunteer',
        is_verified: true, // Auto-verify for mobile
      });

      // Create profile based on role
      const userRole = (role || 'volunteer') as UserRole;
      if (userRole === UserRole.VOLUNTEER) {
        const profile = await VolunteerProfile.create({
          interested_on: ["General Support"],
          phone_number: "+61",
          referral_source: "Other",
          is_currently_studying: "yes",
          non_student_type: "general_public"
        });
        newUser.volunteer_profile = profile._id;
      } else if (userRole === UserRole.MENTOR) {
        const profile = await MentorProfile.create({
          interested_on: ["Mentoring"],
          phone_number: "+61",
          referral_source: "Other",
          is_currently_studying: "yes",
          non_student_type: "general_public"
        });
        newUser.mentor_profile = profile._id;
      } else if (userRole === UserRole.ADMIN || userRole === UserRole.ORGANIZATION) {
        const profile = await OrganizationProfile.create({
          title: name,
          type: "nonprofit",
          opportunity_types: ["General Support"],
          required_skills: ["General"]
        });
        newUser.organization_profile = profile._id;
      }

      await newUser.save();

      const tokens = await createMobileTokens(newUser._id.toString());

      return {
        message: 'Registered successfully',
        status: httpStatus.OK,
        data: {
          ...tokens,
          user: {
            id: newUser._id.toString(),
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            image: newUser.image,
          },
        },
      };
    }),

  /**
   * Token refresh endpoint
   * Mobile apps use this to get a new access token when the current one expires
   * Requires a valid refresh token
   */
  refreshToken: publicProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { refreshToken } = input;

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded || !decoded.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired refresh token');
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      const tokens = await createMobileTokens(user._id.toString());

      return {
        message: 'Token refreshed successfully',
        status: httpStatus.OK,
        data: tokens,
      };
    }),

  /**
   * Get current user details
   * Used for session restoration
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const sessionUser = ctx.user as JwtPayload;
    if (!sessionUser?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not logged in",
      });
    }

    const user = await User.findById(sessionUser.id);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    };
  }),
});
