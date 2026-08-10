/* eslint-disable @typescript-eslint/no-explicit-any */
import User from '../db/models/user';
import MentorProfile from '../db/models/mentor-profile';
import { AppError } from '../lib/errors.js';
import {
  UpdateMentorProfileInput,
  GetPublicMentorsQuery,
  PublicMentorProfileInput,
} from '../validators/mentor-profile.validator.js';

// Cast models to avoid Mongoose union-type generic issues with .find() overloads
const UserModel = User as any;
const MentorModel = MentorProfile as any;

const PLACEHOLDER_ROLES = [
  'Outreach Coordinator',
  'Logistics Coordinator',
  'Volunteer Engagement Lead',
  'Communications Specialist',
  'Event Planner',
  'Mentor',
];

export async function getPublicMentors(input?: GetPublicMentorsQuery) {
  const limit = input?.limit ?? 50;

  const users = (await UserModel.find({ role: 'mentor' })
    .populate('mentor_profile')
    .limit(limit)
    .lean()) as any[];

  const mentors = users
    .filter((u) => u.mentor_profile && u.name)
    .map((u, i) => {
      const profile = u.mentor_profile;
      const firstInterest = Array.isArray(profile?.interested_on)
        ? profile.interested_on[0]
        : null;
      const role = firstInterest
        ? `${firstInterest} Mentor`
        : PLACEHOLDER_ROLES[i % PLACEHOLDER_ROLES.length];

      return {
        id: u._id.toString(),
        name: u.name,
        image: u.image || null,
        role,
      };
    });

  return mentors;
}

export async function getPublicMentorProfile(input: PublicMentorProfileInput) {
  const user = (await UserModel.findOne({ _id: input.userId, role: 'mentor' })
    .populate('mentor_profile')
    .lean()) as any;
  if (!user || !user.mentor_profile || !user.name) {
    throw new AppError(404, 'Mentor profile not found.');
  }

  const profile = user.mentor_profile;
  const firstInterest = profile?.interested_on?.[0];
  const role = firstInterest ? `${firstInterest} Mentor` : 'Mentor';

  return {
    id: user._id.toString(),
    name: user.name,
    image: user.image || null,
    role,
    bio: profile.bio || null,
    interested_on: profile.interested_on || [],
    interested_categories: profile.interested_categories || [],
    area: profile.area || null,
    state: profile.state || null,
    postcode: profile.postcode || null,
    country: profile.country || null,
    home_country: profile.home_country || null,
    student_type: profile.student_type || null,
    is_currently_studying: profile.is_currently_studying || null,
    non_student_type: profile.non_student_type || null,
    university: profile.university || null,
    graduation_year: profile.graduation_year || null,
    course: profile.course || null,
    major: profile.major || null,
    major_other: profile.major_other || null,
    study_area: profile.study_area || null,
    availability_date: profile.availability_date || null,
    availability_time: profile.availability_time || null,
    is_available: profile.is_available ?? null,
  };
}

export async function getMentorProfile(userId: string) {
  const user = (await UserModel.findById(userId)
    .populate('mentor_profile')
    .lean()) as any;
  if (!user || !user.mentor_profile) {
    throw new AppError(404, 'Mentor profile not found.');
  }

  return {
    ...user.mentor_profile,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}

export async function updateMentorProfile(userId: string, input: UpdateMentorProfileInput) {
  const user = await UserModel.findById(userId);
  if (!user || !user.mentor_profile) {
    throw new AppError(404, 'Mentor profile not found.');
  }

  const { name, image, ...profileData } = input;

  if (name || image) {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { ...(name && { name }), ...(image && { image }) } },
    );
  }

  const updatedProfile = await MentorModel.findByIdAndUpdate(
    user.mentor_profile,
    { $set: profileData },
    { new: true },
  );

  return updatedProfile;
}