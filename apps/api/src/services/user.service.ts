/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcryptjs';
import User from '../db/models/user';
import VolunteerProfile from '../db/models/volunteer-profile';
import MentorProfile from '../db/models/mentor-profile';
import OrganizationProfile from '../db/models/organization-profile';
import { AppError } from '../lib/errors.js';
import {
  AvailableUsersQuery,
  OnlineStatusQuery,
  OrganizationUsersInput,
  UserIdInput,
  UpdateUserInput,
  ResetPasswordInput,
  VolunteerProfileInput,
  OrganizationProfileInput,
  UpdateUserRoleInput,
} from '../validators/user.validator.js';

// Cast models to avoid Mongoose union-type generic issues with .find() overloads
const UserModel = User as any;
const VolunteerModel = VolunteerProfile as any;
const MentorModel = MentorProfile as any;
const OrgModel = OrganizationProfile as any;

export async function getAvailableUsers(userId: string, input: AvailableUsersQuery) {
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) throw new AppError(404, 'Current user not found');

  const { page, limit, search, categories, studentType, memberType, availability, location, sortBy, includeMentors } = input;
  const skip = (page - 1) * limit;

  const baseQuery: Record<string, unknown> = {
    _id: { $ne: currentUser._id },
  };

  if (currentUser.role === 'volunteer') {
    baseQuery.role = { $in: ['admin', 'mentor'] };
  } else if (
    currentUser.role === 'admin' ||
    currentUser.role === 'mentor' ||
    currentUser.role === 'organization'
  ) {
    baseQuery.role = includeMentors ? { $in: ['volunteer', 'mentor'] } : 'volunteer';
  } else {
    return { users: [], total: 0, totalPages: 0 };
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    if (currentUser.role === 'volunteer') {
      baseQuery.$or = [
        { name: searchRegex },
        { 'organization_profile.title': searchRegex },
        { 'organization_profile.bio': searchRegex },
      ];
    } else if (includeMentors) {
      baseQuery.$or = [{ name: searchRegex }];
    } else {
      baseQuery.$or = [
        { name: searchRegex },
        { 'volunteer_profile.course': searchRegex },
        { 'volunteer_profile.bio': searchRegex },
        { 'volunteer_profile.interested_on': searchRegex },
      ];
    }
  }

  if (
    categories &&
    categories.length > 0 &&
    !includeMentors &&
    (currentUser.role === 'admin' || currentUser.role === 'mentor' || currentUser.role === 'organization')
  ) {
    baseQuery['volunteer_profile.interested_on'] = { $in: categories };
  }

  if (
    studentType !== 'all' &&
    !includeMentors &&
    (currentUser.role === 'admin' || currentUser.role === 'mentor' || currentUser.role === 'organization')
  ) {
    baseQuery['volunteer_profile.is_currently_studying'] = studentType;
  } else if (
    studentType === 'all' &&
    !includeMentors &&
    (currentUser.role === 'admin' || currentUser.role === 'mentor' || currentUser.role === 'organization')
  ) {
    baseQuery.$or = [
      { 'volunteer_profile.is_currently_studying': { $in: ['yes', 'no'] } },
      { 'volunteer_profile.is_currently_studying': { $exists: false } },
    ];
  }

  if (
    memberType !== 'all' &&
    !includeMentors &&
    (currentUser.role === 'admin' || currentUser.role === 'mentor' || currentUser.role === 'organization')
  ) {
    baseQuery['volunteer_profile.non_student_type'] = memberType;
  }

  if (
    availability?.startDate &&
    availability?.endDate &&
    !includeMentors &&
    (currentUser.role === 'admin' || currentUser.role === 'mentor' || currentUser.role === 'organization')
  ) {
    baseQuery['volunteer_profile.availability_date.start_date'] = {
      $exists: true,
      $ne: null,
      $lte: availability.endDate,
    };
    baseQuery['volunteer_profile.availability_date.end_date'] = {
      $exists: true,
      $ne: null,
      $gte: availability.startDate,
    };
  }

  if (
    location &&
    !includeMentors &&
    (currentUser.role === 'admin' || currentUser.role === 'mentor' || currentUser.role === 'organization')
  ) {
    const locationRegex = new RegExp(location, 'i');
    baseQuery.$or = [
      ...(baseQuery.$or as Array<Record<string, unknown>> || []),
      { 'volunteer_profile.area': locationRegex },
      { 'volunteer_profile.state': locationRegex },
    ];
  }

  if (
    sortBy === 'available' &&
    !includeMentors &&
    (currentUser.role === 'admin' || currentUser.role === 'mentor' || currentUser.role === 'organization')
  ) {
    baseQuery['volunteer_profile.is_available'] = true;
  } else if (
    sortBy === 'not_available' &&
    !includeMentors &&
    (currentUser.role === 'admin' || currentUser.role === 'mentor' || currentUser.role === 'organization')
  ) {
    baseQuery['volunteer_profile.is_available'] = false;
  }

  let total, totalPages;

  if (currentUser.role === 'volunteer' || includeMentors) {
    total = await UserModel.countDocuments(baseQuery);
    totalPages = Math.ceil(total / limit);
  } else {
    const countPipeline = [
      { $match: { _id: { $ne: currentUser._id }, role: 'volunteer' } },
      {
        $lookup: {
          from: 'volunteer_profiles',
          localField: 'volunteer_profile',
          foreignField: '_id',
          as: 'volunteer_profile',
        },
      },
      { $unwind: '$volunteer_profile' },
      {
        $match: {
          $and: [
            search
              ? {
                  $or: [
                    { name: new RegExp(search, 'i') },
                    { 'volunteer_profile.course': new RegExp(search, 'i') },
                    { 'volunteer_profile.bio': new RegExp(search, 'i') },
                    { 'volunteer_profile.interested_on': new RegExp(search, 'i') },
                  ],
                }
              : {},
            categories && categories.length > 0
              ? { 'volunteer_profile.interested_on': { $in: categories } }
              : {},
            studentType !== 'all'
              ? { 'volunteer_profile.is_currently_studying': studentType }
              : {
                  $or: [
                    { 'volunteer_profile.is_currently_studying': { $in: ['yes', 'no'] } },
                    { 'volunteer_profile.is_currently_studying': { $exists: false } },
                  ],
                },
            memberType !== 'all'
              ? { 'volunteer_profile.non_student_type': memberType }
              : {},
            availability?.startDate && availability?.endDate
              ? {
                  'volunteer_profile.availability_date.start_date': {
                    $exists: true,
                    $ne: null,
                    $lte: availability.endDate,
                  },
                  'volunteer_profile.availability_date.end_date': {
                    $exists: true,
                    $ne: null,
                    $gte: availability.startDate,
                  },
                }
              : {},
            location
              ? {
                  $or: [
                    { 'volunteer_profile.area': new RegExp(location, 'i') },
                    { 'volunteer_profile.state': new RegExp(location, 'i') },
                  ],
                }
              : {},
            sortBy === 'available' ? { 'volunteer_profile.is_available': true } : {},
            sortBy === 'not_available'
              ? { 'volunteer_profile.is_available': false }
              : {},
          ].filter((condition) => Object.keys(condition).length > 0),
        },
      },
      { $count: 'total' },
    ];

    const countResult = await UserModel.aggregate(countPipeline);
    total = countResult.length > 0 ? countResult[0].total : 0;
    totalPages = Math.ceil(total / limit);
  }

  let users;
  if (currentUser.role === 'volunteer') {
    users = await UserModel.find(baseQuery)
      .select('name image role')
      .populate('organization_profile')
      .skip(skip)
      .limit(limit)
      .lean();
  } else if (includeMentors) {
    users = await UserModel.find(baseQuery)
      .select('name image role')
      .skip(skip)
      .limit(limit)
      .lean();
  } else {
    const pipeline = [
      { $match: { _id: { $ne: currentUser._id }, role: 'volunteer' } },
      {
        $lookup: {
          from: 'volunteer_profiles',
          localField: 'volunteer_profile',
          foreignField: '_id',
          as: 'volunteer_profile',
        },
      },
      { $unwind: '$volunteer_profile' },
      {
        $match: {
          $and: [
            search
              ? {
                  $or: [
                    { name: new RegExp(search, 'i') },
                    { 'volunteer_profile.course': new RegExp(search, 'i') },
                    { 'volunteer_profile.bio': new RegExp(search, 'i') },
                    { 'volunteer_profile.interested_on': new RegExp(search, 'i') },
                  ],
                }
              : {},
            categories && categories.length > 0
              ? { 'volunteer_profile.interested_on': { $in: categories } }
              : {},
            studentType !== 'all'
              ? { 'volunteer_profile.is_currently_studying': studentType }
              : {
                  $or: [
                    { 'volunteer_profile.is_currently_studying': { $in: ['yes', 'no'] } },
                    { 'volunteer_profile.is_currently_studying': { $exists: false } },
                  ],
                },
            memberType !== 'all'
              ? { 'volunteer_profile.non_student_type': memberType }
              : {},
            availability?.startDate && availability?.endDate
              ? {
                  'volunteer_profile.availability_date.start_date': {
                    $exists: true,
                    $ne: null,
                    $lte: availability.endDate,
                  },
                  'volunteer_profile.availability_date.end_date': {
                    $exists: true,
                    $ne: null,
                    $gte: availability.startDate,
                  },
                }
              : {},
            location
              ? {
                  $or: [
                    { 'volunteer_profile.area': new RegExp(location, 'i') },
                    { 'volunteer_profile.state': new RegExp(location, 'i') },
                  ],
                }
              : {},
            sortBy === 'available' ? { 'volunteer_profile.is_available': true } : {},
            sortBy === 'not_available'
              ? { 'volunteer_profile.is_available': false }
              : {},
          ].filter((condition) => Object.keys(condition).length > 0),
        },
      },
      {
        $project: {
          name: 1,
          image: 1,
          role: 1,
          area: '$volunteer_profile.area',
          state: '$volunteer_profile.state',
          volunteer_profile: {
            student_type: 1,
            course: 1,
            availability_date: 1,
            interested_on: 1,
            bio: 1,
            is_available: 1,
          },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    users = await UserModel.aggregate(pipeline);
  }

  return {
    users,
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: userId },
    { ...input },
    { new: true, runValidators: true },
  );

  if (!updatedUser) throw new AppError(500, 'User update failed');

  return updatedUser;
}

export async function profileCheckup(userId: string) {
  const user = await UserModel.findById(userId)
    .populate('volunteer_profile')
    .populate('mentor_profile')
    .populate('organization_profile');

  if (!user) throw new AppError(404, 'User not found in database.');

  return {
    hasVolunteerProfile: !!user.volunteer_profile,
    hasMentorProfile: !!user.mentor_profile,
    hasOrganizationProfile: !!user.organization_profile,
    volunteerProfile: user.volunteer_profile,
    mentorProfile: user.mentor_profile,
    organizationProfile: user.organization_profile,
  };
}

export async function setupVolunteerProfile(userId: string, input: VolunteerProfileInput) {
  const volunteerProfile = await VolunteerModel.create({
    ...input,
  });

  if (!volunteerProfile) {
    throw new AppError(500, 'Failed to create volunteer profile');
  }

  return volunteerProfile;
}

export async function setupMentorProfile(userId: string, input: VolunteerProfileInput) {
  const mentorProfile = await MentorModel.create({
    ...input,
  });

  if (!mentorProfile) {
    throw new AppError(500, 'Failed to create mentor profile');
  }

  return mentorProfile;
}

export async function setupOrgProfile(userId: string, input: OrganizationProfileInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  if (user.organization_profile) {
    if (!input.opportunity_types?.length) {
      throw new AppError(400, 'At least one opportunity type is required');
    }
    if (!input.required_skills?.length) {
      throw new AppError(400, 'At least one required skill is required');
    }

    const updateData = {
      ...input,
      updatedAt: new Date(),
    };

    let updatedProfile;
    try {
      updatedProfile = await OrgModel.findByIdAndUpdate(
        user.organization_profile,
        updateData,
        {
          new: true,
          runValidators: true,
          context: 'query',
        },
      );
    } catch (error) {
      throw new AppError(400, error instanceof Error ? error.message : 'Validation failed');
    }

    if (!updatedProfile) throw new AppError(500, 'Failed to update organization profile');
    return updatedProfile;
  }

  let organizationProfile;
  try {
    organizationProfile = await OrgModel.create({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    throw new AppError(400, error instanceof Error ? error.message : 'Failed to create profile');
  }

  if (!organizationProfile) throw new AppError(500, 'Failed to create organization profile');

  await UserModel.findByIdAndUpdate(user._id, {
    organization_profile: organizationProfile._id,
  });

  return organizationProfile;
}

export async function resetPassword(input: ResetPasswordInput) {
  const { email, password } = input;

  const existingUser = await UserModel.findOne({ email });
  if (!existingUser) {
    throw new AppError(
      404,
      'No account found with this email address. Please check and try again.',
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const updatedUser = await UserModel.findOneAndUpdate(
    { email },
    { password: hashedPassword },
    { new: true },
  );

  if (!updatedUser) {
    throw new AppError(500, 'Password reset failed. Please try again.');
  }

  return {
    success: true,
    message: 'Password has been successfully reset',
  };
}

export async function getOrganizationUsers(userId: string, input: OrganizationUsersInput) {
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) throw new AppError(404, 'Current user not found.');

  if (currentUser.role !== 'admin' && currentUser.role !== 'mentor') {
    throw new AppError(403, 'Only admins can view organisation users.');
  }

  const users = await UserModel.find({
    organization_profile: input.organizationId,
  }).select('name email role avatar');

  return users;
}

export async function updateUserRole(userId: string, input: UpdateUserRoleInput) {
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) throw new AppError(404, 'Current user not found.');

  if (currentUser.role !== 'admin') {
    throw new AppError(403, 'Only admins can update user roles.');
  }

  const userToUpdate = await UserModel.findById(input.userId);
  if (!userToUpdate) throw new AppError(404, 'User to update not found.');

  if (
    userToUpdate.organization_profile?.toString() !==
    currentUser.organization_profile?.toString()
  ) {
    throw new AppError(403, 'Cannot update user from a different organization.');
  }

  userToUpdate.role = input.role;
  await userToUpdate.save();

  return userToUpdate;
}

export async function demoteMentor(userId: string, input: UserIdInput) {
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) throw new AppError(404, 'Current user not found.');

  if (currentUser.role !== 'admin') {
    throw new AppError(403, 'Only admins can demote mentors.');
  }

  const userToDemote = await UserModel.findById(input.userId);
  if (!userToDemote) throw new AppError(404, 'User to demote not found.');

  if (
    userToDemote.organization_profile?.toString() !==
    currentUser.organization_profile?.toString()
  ) {
    throw new AppError(403, 'Cannot demote user from a different organization.');
  }

  if (userToDemote.role !== 'mentor') {
    throw new AppError(400, 'Can only demote users with mentor role.');
  }

  userToDemote.role = 'volunteer';
  await userToDemote.save();

  return userToDemote;
}

export async function deleteUser(userId: string, input: UserIdInput) {
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) throw new AppError(404, 'Current user not found.');

  if (currentUser.role !== 'admin' && currentUser.role !== 'mentor') {
    throw new AppError(403, 'Only admins can delete users.');
  }

  const userToDelete = await UserModel.findById(input.userId);
  if (!userToDelete) throw new AppError(404, 'User to delete not found.');

  if (
    userToDelete.organization_profile?.toString() !==
    currentUser.organization_profile?.toString()
  ) {
    throw new AppError(403, 'Cannot delete user from a different organization.');
  }

  if (userToDelete.role === 'admin') {
    const adminCount = await UserModel.countDocuments({
      organization_profile: currentUser.organization_profile,
      role: 'admin',
    });

    if (adminCount <= 1) {
      throw new AppError(400, 'Cannot delete the last admin of the organization.');
    }
  }

  await UserModel.findByIdAndDelete(input.userId);

  return { success: true };
}

export async function sendHeartbeat() {
  return { success: true };
}

export async function getUsersOnlineStatus(input: OnlineStatusQuery) {
  return input.userIds.length > 0
    ? input.userIds.reduce(
        (acc, id) => ({ ...acc, [id]: false }),
        {} as Record<string, boolean>,
      )
    : {};
}

export async function getPublicVolunteers(input: AvailableUsersQuery) {
  const { page, limit, search, categories, studentType, memberType, availability, location, sortBy } = input;
  const skip = (page - 1) * limit;

  const matchConditions = [
    search
      ? {
          $or: [
            { name: new RegExp(search, 'i') },
            { 'volunteer_profile.course': new RegExp(search, 'i') },
            { 'volunteer_profile.bio': new RegExp(search, 'i') },
            { 'volunteer_profile.interested_on': { $in: [new RegExp(search, 'i')] } },
          ],
        }
      : {},
    studentType !== 'all' ? { 'volunteer_profile.is_currently_studying': studentType } : {},
    memberType !== 'all' ? { 'volunteer_profile.non_student_type': memberType } : {},
    availability?.startDate && availability?.endDate
      ? {
          'volunteer_profile.availability_date.start_date': {
            $exists: true,
            $ne: null,
            $lte: availability.endDate,
          },
          'volunteer_profile.availability_date.end_date': {
            $exists: true,
            $ne: null,
            $gte: availability.startDate,
          },
        }
      : {},
    location
      ? {
          $or: [
            { 'volunteer_profile.state': new RegExp(location, 'i') },
            { 'volunteer_profile.area': new RegExp(location, 'i') },
          ],
        }
      : {},
    sortBy === 'available' ? { 'volunteer_profile.is_available': true } : {},
    sortBy === 'not_available' ? { 'volunteer_profile.is_available': false } : {},
  ].filter((condition) => Object.keys(condition).length > 0);

  const matchStage =
    matchConditions.length > 0
      ? { $match: { $and: matchConditions } }
      : { $match: {} };

  const countPipeline: any[] = [
    { $match: { role: 'volunteer' } },
    {
      $lookup: {
        from: 'volunteer_profiles',
        localField: 'volunteer_profile',
        foreignField: '_id',
        as: 'volunteer_profile',
      },
    },
    { $unwind: '$volunteer_profile' },
    matchStage,
    { $count: 'total' },
  ];

  const countResult = await UserModel.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;
  const totalPages = Math.ceil(total / limit);

  const pipeline: any[] = [
    { $match: { role: 'volunteer' } },
    {
      $lookup: {
        from: 'volunteer_profiles',
        localField: 'volunteer_profile',
        foreignField: '_id',
        as: 'volunteer_profile',
      },
    },
    { $unwind: '$volunteer_profile' },
    matchStage,
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        name: 1,
        image: 1,
        role: 1,
        area: '$volunteer_profile.area',
        state: '$volunteer_profile.state',
        'volunteer_profile.student_type': 1,
        'volunteer_profile.course': 1,
        'volunteer_profile.availability_date': 1,
        'volunteer_profile.interested_on': 1,
        'volunteer_profile.bio': 1,
        'volunteer_profile.is_available': 1,
        'volunteer_profile.state': 1,
        'volunteer_profile.area': 1,
      },
    },
  ];

  const users = await UserModel.aggregate(pipeline);

  return {
    users,
    total,
    totalPages,
  };
}