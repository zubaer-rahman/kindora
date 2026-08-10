/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import OrganizationProfile from '../db/models/organization-profile';
import User from '../db/models/user';
import Opportunity from '../db/models/opportunity';
import FavoriteOrganization from '../db/models/favorite-organization';
import { AppError } from '../lib/errors.js';
import {
  ListOrganizationsQuery,
  FavoriteOrganizationInput,
  FavoritesPaginationInput,
} from '../validators/organization-profile.validator.js';

// Cast models to avoid Mongoose union-type generic issues with .find() overloads
const OrgModel = OrganizationProfile as any;
const UserModel = User as any;
const OppModel = Opportunity as any;
const FavOrgModel = FavoriteOrganization as any;

export async function getOrganizationProfile(userId: string, organizationId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  const organizationProfile = await OrgModel.findById(organizationId);

  if (!organizationProfile) {
    throw new AppError(404, 'Organisation profile not found');
  }

  return {
    organizationProfile,
    user: {
      name: user.name,
      email: user.email,
    },
  };
}

export async function getAllOrganizations(input: ListOrganizationsQuery) {
  const { search, category, page, limit, sortBy } = input;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
      { area: { $regex: search, $options: 'i' } },
      { state: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    query.opportunity_types = { $in: [category] };
  }

  let sortObject: Record<string, 1 | -1> = {};
  switch (sortBy) {
    case 'name':
      sortObject = { title: 1 };
      break;
    case 'updated':
    default:
      sortObject = { updatedAt: -1 };
      break;
  }

  const organizations = await OrgModel.find(query)
    .sort(sortObject)
    .skip(skip)
    .limit(limit);

  const total = await OrgModel.countDocuments(query);

  const organizationsWithCounts = await Promise.all(
    organizations.map(async (org: any) => {
      const now = new Date();

      const opportunityCount = await OppModel.countDocuments({
        organization_profile: org._id,
        is_archived: false,
        $or: [
          {
            start_date: { $exists: false },
            'recurrence.date_range.start_date': { $exists: false },
          },
          {
            start_date: { $exists: true, $gte: now },
            'recurrence.date_range.start_date': { $exists: false },
          },
          {
            'recurrence.date_range.end_date': { $exists: true, $gte: now },
          },
          {
            'recurrence.date_range.start_date': { $exists: true },
            'recurrence.date_range.end_date': { $exists: false },
          },
        ],
      });

      return {
        ...org.toObject(),
        opportunityCount,
      };
    }),
  );

  return {
    organizations: organizationsWithCounts,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getFavoriteStatus(userId: string, input: FavoriteOrganizationInput) {
  const user = await UserModel.findById(userId);
  if (!user) return { isFavorite: false };

  if (!mongoose.Types.ObjectId.isValid(input.organizationId)) {
    return { isFavorite: false };
  }

  const favorite = await FavOrgModel.findOne({
    user: user._id,
    organization: input.organizationId,
  });

  return {
    isFavorite: !!favorite,
  };
}

export async function toggleFavorite(userId: string, input: FavoriteOrganizationInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  if (!mongoose.Types.ObjectId.isValid(input.organizationId)) {
    throw new AppError(400, 'Invalid organisation ID.');
  }

  const favorite = await FavOrgModel.findOne({
    user: user._id,
    organization: input.organizationId,
  });

  if (favorite) {
    await FavOrgModel.deleteOne({
      user: user._id,
      organization: input.organizationId,
    });
    return { isFavorite: false };
  } else {
    await FavOrgModel.create({
      user: user._id,
      organization: input.organizationId,
    });
    return { isFavorite: true };
  }
}

function emptyFavoritesPage(page: number) {
  return {
    organizations: [],
    total: 0,
    totalPages: 0,
    currentPage: page,
  };
}

export async function getFavoriteOrganizationsWithPagination(
  userId: string,
  input: FavoritesPaginationInput,
) {
  const user = await UserModel.findById(userId);
  if (!user) return emptyFavoritesPage(input.page);

  const { page, limit } = input;
  const skip = (page - 1) * limit;

  const favorites = await FavOrgModel.find({ user: user._id })
    .select('organization')
    .lean()
    .exec();

  const favoriteOrganizationIds = favorites.map((fav: any) => fav.organization);

  if (favoriteOrganizationIds.length === 0) {
    return emptyFavoritesPage(page);
  }

  const total = await OrgModel.countDocuments({
    _id: { $in: favoriteOrganizationIds },
  });

  const organizations = await OrgModel.find({
    _id: { $in: favoriteOrganizationIds },
  })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const organizationsWithCounts = await Promise.all(
    organizations.map(async (org: any) => {
      const opportunityCount = await OppModel.countDocuments({
        organization_profile: org._id,
        is_archived: false,
      });

      return {
        ...org,
        opportunityCount,
      };
    }),
  );

  return {
    organizations: organizationsWithCounts,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getOrganizationNames() {
  const organizations = await OrgModel.find({}).select('title _id').sort({ title: 1 }).lean();

  return (organizations as any[]).map((org) => ({
    label: org.title,
    value: org._id.toString(),
  }));
}