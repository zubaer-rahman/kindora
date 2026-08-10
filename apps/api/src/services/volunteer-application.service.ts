/* eslint-disable @typescript-eslint/no-explicit-any */
import User from '../db/models/user';
import VolunteerApplication from '../db/models/volunteer-application';
import Opportunity from '../db/models/opportunity';
import FavoriteOpportunity from '../db/models/favorite-opportunity';
import OpportunityMentor from '../db/models/opportunity-mentor';
import { AppError } from '../lib/errors.js';
import {
  OpportunityIdInput,
  PaginationInput,
  CompletedOpportunitiesQuery,
} from '../validators/volunteer-application.validator.js';
import { notificationService } from './notification.js';
import { formatText } from '../helpers/formatText.js';

// Cast models to avoid Mongoose union-type generic issues with .find() overloads
const UserModel = User as any;
const AppModel = VolunteerApplication as any;
const OppModel = Opportunity as any;
const FavModel = FavoriteOpportunity as any;
const MentorModel = OpportunityMentor as any;

function paginatedDefault(page: number) {
  return {
    applications: [],
    total: 0,
    totalPages: 0,
    currentPage: page,
    hasNextPage: false,
    hasPrevPage: false,
  };
}

export async function getApplicationStatus(userId: string, input: OpportunityIdInput) {
  const user = await UserModel.findById(userId);
  if (!user?.volunteer_profile) return { status: null };

  const application = await AppModel.findOne({
    opportunity: input.opportunityId,
    volunteer: user._id,
  }).lean();

  return { status: application?.status || null };
}

export async function getVolunteerApplications(volunteerId: string) {
  const applications = await AppModel.find({ volunteer: volunteerId })
    .populate({
      path: 'opportunity',
      select: 'title description category location commitment_type',
    })
    .sort({ createdAt: -1 })
    .lean();

  return applications;
}

export async function getCurrentUserApplications(userId: string, input: PaginationInput) {
  const user = await UserModel.findById(userId);
  if (!user) return paginatedDefault(input.page);

  const { page, limit } = input;
  const skip = (page - 1) * limit;

  const total = await AppModel.countDocuments({ volunteer: user._id });
  const totalPages = Math.ceil(total / limit);

  const applications = await AppModel.find({ volunteer: user._id })
    .populate({
      path: 'opportunity',
      select:
        'title description category location commitment_type organization_profile createdAt date time',
      populate: {
        path: 'organization_profile',
        select: 'title profile_img',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    applications,
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export async function getCurrentUserActiveApplications(userId: string, input: PaginationInput) {
  const user = await UserModel.findById(userId);
  if (!user) return paginatedDefault(input.page);

  const { page, limit } = input;
  const skip = (page - 1) * limit;
  const now = new Date();

  const allApplications = await AppModel.find({ volunteer: user._id })
    .populate({
      path: 'opportunity',
      select:
        'title description category location commitment_type organization_profile createdAt date time is_deleted is_archived number_of_volunteers',
      populate: {
        path: 'organization_profile',
        select: 'title profile_img',
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  const activeApplications = allApplications.filter((app: any) => {
    if (!app.opportunity) return false;
    if (app.opportunity.is_deleted === true) return false;
    if (app.opportunity.is_archived === true) return false;
    if (app.opportunity.date?.start_date) {
      const startDate = new Date(app.opportunity.date.start_date);
      return startDate >= now;
    }
    return true;
  });

  const applicationsWithCounts = await Promise.all(
    activeApplications.map(async (app: any) => {
      if (!app.opportunity) return app;
      const applicantCount = await AppModel.countDocuments({
        opportunity: app.opportunity._id || app.opportunity.id,
        status: { $in: ['pending', 'approved'] },
      });
      return {
        ...app,
        opportunity: {
          ...app.opportunity,
          applicantCount,
        },
      };
    }),
  );

  const total = applicationsWithCounts.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = skip;
  const endIndex = startIndex + limit;
  const paginatedApplications = applicationsWithCounts.slice(startIndex, endIndex);

  return {
    applications: paginatedApplications,
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export async function getCurrentUserApprovedApplications(userId: string, input: PaginationInput) {
  const user = await UserModel.findById(userId);
  if (!user) return paginatedDefault(input.page);

  const { page, limit } = input;
  const skip = (page - 1) * limit;
  const now = new Date();

  const allApplications = await AppModel.find({
    volunteer: user._id,
    status: 'approved',
  })
    .populate({
      path: 'opportunity',
      select:
        'title description category location commitment_type organization_profile createdAt date time is_deleted is_archived number_of_volunteers',
      populate: {
        path: 'organization_profile',
        select: 'title profile_img',
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  const approvedApplications = allApplications.filter((app: any) => {
    if (!app.opportunity) return false;
    if (app.opportunity.is_deleted === true) return false;
    if (app.opportunity.is_archived === true) return false;

    const endDate = app.opportunity.date?.end_date
      ? new Date(app.opportunity.date.end_date)
      : app.opportunity.date?.start_date
      ? new Date(app.opportunity.date.start_date)
      : null;

    if (endDate) {
      return endDate >= now;
    }
    return true;
  });

  const applicationsWithCounts = await Promise.all(
    approvedApplications.map(async (app: any) => {
      if (!app.opportunity) return app;
      const applicantCount = await AppModel.countDocuments({
        opportunity: app.opportunity._id || app.opportunity.id,
        status: { $in: ['pending', 'approved'] },
      });
      return {
        ...app,
        opportunity: {
          ...app.opportunity,
          applicantCount,
        },
      };
    }),
  );

  const total = applicationsWithCounts.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = skip;
  const endIndex = startIndex + limit;
  const paginatedApplications = applicationsWithCounts.slice(startIndex, endIndex);

  return {
    applications: paginatedApplications,
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export async function getCurrentUserRecentApplications(userId: string, input: PaginationInput) {
  const user = await UserModel.findById(userId);
  if (!user) return paginatedDefault(input.page);

  const { page, limit } = input;
  const skip = (page - 1) * limit;
  const now = new Date();

  const allApplications = await AppModel.find({ volunteer: user._id })
    .populate({
      path: 'opportunity',
      select:
        'title description category location commitment_type organization_profile createdAt date time is_deleted is_archived',
      populate: {
        path: 'organization_profile',
        select: 'title profile_img',
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  const recentApplications = allApplications.filter((app: any) => {
    if (!app.opportunity) return false;
    if (app.opportunity.is_deleted === true) return false;
    if (app.opportunity.is_archived === true) return false;

    const endDate = app.opportunity.date?.end_date
      ? new Date(app.opportunity.date.end_date)
      : app.opportunity.date?.start_date
      ? new Date(app.opportunity.date.start_date)
      : null;

    if (endDate) {
      return endDate < now;
    }

    return false;
  });

  const total = recentApplications.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = skip;
  const endIndex = startIndex + limit;
  const paginatedApplications = recentApplications.slice(startIndex, endIndex);

  return {
    applications: paginatedApplications,
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export async function getCurrentUserActiveApplicationsCount(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) return { total: 0 };

  const now = new Date();

  const allApplications = await AppModel.find({ volunteer: user._id })
    .populate({
      path: 'opportunity',
      select: 'date is_deleted is_archived',
    })
    .lean();

  const activeApplications = allApplications.filter((app: any) => {
    if (!app.opportunity) return false;
    if (app.opportunity.is_deleted === true) return false;
    if (app.opportunity.is_archived === true) return false;
    if (app.opportunity.date?.start_date) {
      const startDate = new Date(app.opportunity.date.start_date);
      return startDate >= now;
    }
    return true;
  });

  return { total: activeApplications.length };
}

export async function getCurrentUserRecentApplicationsCount(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) return { total: 0 };

  const now = new Date();

  const allApplications = await AppModel.find({ volunteer: user._id })
    .populate({
      path: 'opportunity',
      select: 'date is_deleted is_archived',
    })
    .lean();

  const recentApplications = allApplications.filter((app: any) => {
    if (!app.opportunity) return false;
    if (app.opportunity.is_deleted === true) return false;
    if (app.opportunity.is_archived === true) return false;

    const endDate = app.opportunity.date?.end_date
      ? new Date(app.opportunity.date.end_date)
      : app.opportunity.date?.start_date
      ? new Date(app.opportunity.date.start_date)
      : null;

    if (endDate) {
      return endDate < now;
    }

    return false;
  });

  return { total: recentApplications.length };
}

export async function applyToOpportunity(userId: string, input: OpportunityIdInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  const opportunity = await OppModel.findById(input.opportunityId);
  if (!opportunity) throw new AppError(404, 'Opportunity not found.');

  const now = new Date();
  const opportunityEndDate =
    opportunity.date?.end_date || opportunity.date?.start_date;

  if (opportunityEndDate && new Date(opportunityEndDate) < now) {
    throw new AppError(
      400,
      'This opportunity has already ended and is no longer accepting applications.',
    );
  }

  const existingApplication = await AppModel.findOne({
    opportunity: input.opportunityId,
    volunteer: user._id,
  });

  if (existingApplication) {
    throw new AppError(400, 'You have already applied for this opportunity.');
  }

  const application = await AppModel.create({
    opportunity: input.opportunityId,
    volunteer: user._id,
  });

  if (!application) {
    throw new AppError(500, 'Failed to apply for opportunity.');
  }

  return application;
}

export async function revokeApplication(userId: string, input: OpportunityIdInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  const result = await AppModel.findOneAndDelete({
    volunteer: user._id,
    opportunity: input.opportunityId,
  });
  if (!result) throw new AppError(404, 'Application not found');

  await MentorModel.deleteOne({
    volunteer: user._id,
    opportunity: input.opportunityId,
  });

  const opportunity = await OppModel.findById(input.opportunityId).populate(
    'organization_profile',
    'title',
  );
  if (opportunity && opportunity.organization_profile) {
    const organizationId = opportunity.organization_profile._id?.toString();
    const organizationName = opportunity.organization_profile.title;
    const opportunityTitle = opportunity.title;
    await notificationService.sendVolunteerWithdrewNotification(
      input.opportunityId,
      opportunityTitle,
      organizationId,
      organizationName,
      user.name,
    );
  }

  return { success: true };
}

export async function getFavoriteStatus(userId: string, input: OpportunityIdInput) {
  const user = await UserModel.findById(userId);
  if (!user) return { isFavorite: false };

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

export async function getVolunteersByOpportunity(userId: string, input: OpportunityIdInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(401, 'You must be logged in to view volunteers');

  const applications = await AppModel.find({
    opportunity: input.opportunityId,
  })
    .populate({
      path: 'volunteer',
      populate: {
        path: 'user',
        select: 'name email image',
      },
    })
    .lean();

  const volunteers = applications.map((app: any) => ({
    _id: app.volunteer._id,
    name: app.volunteer.user.name,
    email: app.volunteer.user.email,
    image: app.volunteer.user.image,
    status: app.status,
    appliedAt: app.createdAt,
  }));

  return volunteers;
}

export async function getOpportunityApplicants(userId: string, input: OpportunityIdInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(401, 'You must be logged in to view applicants.');

  const applications = await AppModel.find({
    opportunity: input.opportunityId,
  })
    .populate({
      path: 'volunteer',
      select: 'name email image',
      populate: {
        path: 'volunteer_profile',
        select: 'state area bio interested_on completed_projects availability',
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  if (!applications) {
    return [];
  }

  const validApplications = applications.filter((app: any) => app.volunteer);

  return validApplications.map((application: any) => {
    const app = application as unknown as {
      _id: { toString(): string };
      volunteer: {
        _id: { toString(): string };
        name?: string;
        email?: string;
        image?: string;
        volunteer_profile?: {
          state?: string;
          area?: string;
          bio?: string;
          interested_on?: string[];
          completed_projects?: number;
          availability?: string;
        };
      };
    };

    const state = app.volunteer.volunteer_profile?.state || '';
    const area = app.volunteer.volunteer_profile?.area || '';
    const location = formatText(area, state);

    return {
      id: app.volunteer._id.toString(),
      name: app.volunteer.name || '',
      email: app.volunteer.email || '',
      profileImg: app.volunteer.image || null,
      location: location,
      bio: app.volunteer.volunteer_profile?.bio || '',
      skills: app.volunteer.volunteer_profile?.interested_on || [],
      completedProjects: app.volunteer.volunteer_profile?.completed_projects || 0,
      availability: app.volunteer.volunteer_profile?.availability || '',
      applicationId: app._id.toString(),
      status: application.status || 'pending',
    } as const;
  });
}

export async function getDynamicCompletedOpportunities(
  userId: string,
  input: CompletedOpportunitiesQuery,
) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(401, 'You must be logged in to view completed opportunities.');

  const currentOpportunity = (await OppModel.findById(input.currentOpportunityId)
    .populate('organization_profile')
    .lean()) as {
    organization_profile?: { _id: string };
    required_skills?: string[];
    category?: string[];
  } | null;

  if (!currentOpportunity) {
    throw new AppError(404, 'Current opportunity not found.');
  }

  const approvedApplications = await AppModel.find({
    volunteer: input.volunteerId,
    status: 'approved',
  })
    .populate({
      path: 'opportunity',
      select:
        'title description category required_skills organization_profile commitment_type date time',
      populate: {
        path: 'organization_profile',
        select: 'title _id',
      },
    })
    .lean();

  const now = new Date();

  const matchingApplications = approvedApplications.filter((app: any) => {
    if (!app.opportunity) return false;

    const opp = app.opportunity as {
      organization_profile?: { _id: string };
      required_skills?: string[];
      category?: string[];
      commitment_type?: string;
      date?: {
        start_date?: Date;
        end_date?: Date;
      };
      time?: {
        start_time?: string;
        end_time?: string;
      };
    };
    const currentOrgId = currentOpportunity.organization_profile?._id?.toString();
    const appOrgId = opp.organization_profile?._id?.toString();

    const isSameOrganization = currentOrgId === appOrgId;

    const currentSkills = currentOpportunity.required_skills || [];
    const currentCategories = currentOpportunity.category || [];
    const appSkills = opp.required_skills || [];
    const appCategories = opp.category || [];

    const hasMatchingSkills = currentSkills.some((skill: string) =>
      appSkills.includes(skill),
    );
    const hasMatchingCategories = currentCategories.some((category: string) =>
      appCategories.includes(category),
    );

    let hasEnded = false;

    if (opp.commitment_type === 'workbased') {
      if (opp.date?.end_date && opp.time?.end_time) {
        const endDateTime = new Date(opp.date.end_date);
        const [endHour, endMinute] = opp.time.end_time.split(':').map(Number);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        hasEnded = endDateTime < now;
      }
    } else if (opp.commitment_type === 'eventbased') {
      if (opp.date?.start_date && opp.time?.start_time) {
        const startDateTime = new Date(opp.date.start_date);
        const [startHour, startMinute] = opp.time.start_time.split(':').map(Number);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        hasEnded = startDateTime < now;
      }
    }

    return (
      isSameOrganization &&
      (hasMatchingSkills || hasMatchingCategories) &&
      hasEnded
    );
  });

  return {
    count: matchingApplications.length,
  };
}