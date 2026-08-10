/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import User from '../db/models/user';
import Volunteer from '../db/models/volunteer-profile';
import FavoriteOpportunity from '../db/models/favorite-opportunity';
import Opportunity from '../db/models/opportunity';
import { AppError } from '../lib/errors.js';
import {
  UpdateVolunteerProfileInput,
  OpportunityIdInput,
  FavoritesPaginationInput,
} from '../validators/volunteer-profile.validator.js';

// Cast models to avoid Mongoose union-type generic issues with .find() overloads
const UserModel = User as any;
const VolunteerModel = Volunteer as any;
const FavModel = FavoriteOpportunity as any;
const OppModel = Opportunity as any;

export async function getVolunteerById(volunteerId: string) {
  const user = await UserModel.findById(volunteerId).populate('volunteer_profile');

  if (!user) {
    throw new AppError(404, 'Volunteer not found.');
  }

  if (!user.volunteer_profile) {
    throw new AppError(404, 'Volunteer profile not found');
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    ...user.volunteer_profile._doc,
  };
}

export async function updateVolunteerProfile(userId: string, input: UpdateVolunteerProfileInput) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  if (!user.volunteer_profile) {
    throw new AppError(
      404,
      'Volunteer profile not found. Please complete your profile setup first.',
    );
  }

  const existingProfile = await VolunteerModel.findById(user.volunteer_profile);
  if (!existingProfile) {
    throw new AppError(404, 'Volunteer profile not found.');
  }

  if (input?.name || input?.image) {
    const userUpdate: { name?: string; image?: string } = {};
    if (input.name) userUpdate.name = input.name;
    if (input.image) userUpdate.image = input.image;

    await UserModel.updateOne({ _id: userId }, { $set: userUpdate });
  }

  const processedInput = {
    ...input,
    ...(input.is_currently_studying === 'yes'
      ? {
          non_student_type: undefined,
          university: undefined,
          graduation_year: undefined,
          study_area: undefined,
        }
      : {}),
    ...(input.is_currently_studying === 'no'
      ? {
          student_type: undefined,
          home_country: undefined,
          course: undefined,
          major: undefined,
          major_other: undefined,
        }
      : {}),
    ...(input.student_type === 'no' ? { home_country: undefined } : {}),
  };

  const updateData = {
    ...existingProfile.toObject(),
    ...processedInput,
    bio: input.bio || existingProfile.bio,
    interested_on:
      input.interested_on !== undefined
        ? input.interested_on
        : existingProfile.interested_on,
    interested_categories:
      input.interested_categories !== undefined
        ? input.interested_categories
        : existingProfile.interested_categories,
    phone_number: input.phone_number || existingProfile.phone_number,
    state: input.state || existingProfile.state,
    area: input.area || existingProfile.area,
    postcode: input.postcode || existingProfile.postcode,
  };

  const updatedVolunteerProfile = await VolunteerModel.findByIdAndUpdate(
    user.volunteer_profile,
    updateData,
    { new: true },
  );

  if (!updatedVolunteerProfile) {
    throw new AppError(500, 'Volunteer Profile update failed');
  }

  return updatedVolunteerProfile;
}

export async function getVolunteerProfile(userId: string) {
  const user = await UserModel.findById(userId).populate('volunteer_profile');
  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  if (!user.volunteer_profile) {
    throw new AppError(404, 'Volunteer profile not found');
  }

  return {
    name: user.name,
    email: user.email,
    image: user.image,
    ...user.volunteer_profile._doc,
  };
}

export async function getFavoriteStatus(userId: string, input: OpportunityIdInput) {
  const user = await UserModel.findById(userId);
  if (!user) return { isFavorite: false };

  if (!mongoose.Types.ObjectId.isValid(input.opportunityId)) {
    return { isFavorite: false };
  }

  const favorite = await FavModel.findOne({
    user: user._id,
    opportunity: input.opportunityId,
  });

  return {
    isFavorite: !!favorite,
  };
}

export async function toggleFavorite(userId: string, input: OpportunityIdInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  if (!mongoose.Types.ObjectId.isValid(input.opportunityId)) {
    throw new AppError(400, 'Invalid opportunity ID.');
  }

  const favorite = await FavModel.findOne({
    user: user._id,
    opportunity: input.opportunityId,
  });

  if (favorite) {
    await FavModel.deleteOne({
      user: user._id,
      opportunity: input.opportunityId,
    });
    return { isFavorite: false };
  } else {
    await FavModel.create({
      user: user._id,
      opportunity: input.opportunityId,
    });
    return { isFavorite: true };
  }
}

export async function getFavoriteOpportunities(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  const favorites = await FavModel.find({ user: user._id })
    .select('opportunity')
    .lean()
    .exec();

  return favorites.map((fav: any) => ({
    _id: fav._id,
    opportunity: fav.opportunity,
  }));
}

function emptyFavoritesPage(page: number) {
  return {
    opportunities: [],
    total: 0,
    totalPages: 0,
    currentPage: page,
    hasNextPage: false,
    hasPrevPage: false,
  };
}

export async function getFavoriteOpportunitiesWithPagination(
  userId: string,
  input: FavoritesPaginationInput,
) {
  const user = await UserModel.findById(userId);
  if (!user) return emptyFavoritesPage(input.page);

  const { page, limit } = input;
  const skip = (page - 1) * limit;

  const favorites = await FavModel.find({ user: user._id })
    .select('opportunity')
    .lean()
    .exec();

  const favoriteOpportunityIds = favorites.map((fav: any) => fav.opportunity);

  if (favoriteOpportunityIds.length === 0) {
    return emptyFavoritesPage(page);
  }

  const total = await OppModel.countDocuments({
    _id: { $in: favoriteOpportunityIds },
    is_archived: { $ne: true },
  });

  const totalPages = Math.ceil(total / limit);

  const opportunities = await OppModel.find({
    _id: { $in: favoriteOpportunityIds },
    is_archived: { $ne: true },
  })
    .populate('organization_profile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    opportunities,
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export async function getFavoriteOpportunitiesCount(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) return { total: 0 };

  const favorites = await FavModel.find({ user: user._id })
    .select('opportunity')
    .lean()
    .exec();

  const favoriteOpportunityIds = favorites.map((fav: any) => fav.opportunity);

  if (favoriteOpportunityIds.length === 0) {
    return { total: 0 };
  }

  const total = await OppModel.countDocuments({
    _id: { $in: favoriteOpportunityIds },
    is_archived: { $ne: true },
  });

  return { total };
}