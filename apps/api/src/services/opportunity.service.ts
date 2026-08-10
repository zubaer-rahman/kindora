/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import Opportunity from '../db/models/opportunity';
import User from '../db/models/user';
import VolunteerApplication from '../db/models/volunteer-application';
import OrganisationRecruitment from '../db/models/organisation-recruitment';
import OpportunityMentor from '../db/models/opportunity-mentor';
import { AppError } from '../lib/errors.js';
import { CreateOpportunityInput, ListOpportunitiesQuery } from '../validators/opportunity.validator.js';
import { notificationService } from './notification.js';

// Cast models to avoid Mongoose union-type generic issues with .find() overloads
const OppModel = Opportunity as any;
const UserModel = User as any;
const AppModel = VolunteerApplication as any;
const RecModel = OrganisationRecruitment as any;
const MentorModel = OpportunityMentor as any;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildListQuery(input: ListOpportunitiesQuery) {
  const base: Record<string, unknown> = {
    is_deleted: { $ne: true },
    is_archived: { $ne: true },
  };
  if (input.search) {
    const rx = new RegExp(input.search, 'i');
    base.$or = [{ title: rx }, { description: rx }, { location: rx }];
  }
  if (input.categories && input.categories.length > 0) {
    base.category = { $in: input.categories };
  }
  if (input.commitmentType !== 'all') {
    if (input.commitmentType === 'eventbased') {
      base.commitment_type = { $in: ['eventbased', 'oneoff'] };
    } else {
      base.commitment_type = { $in: ['workbased', 'regular'] };
    }
  }
  if (input.location) {
    base.location = new RegExp(input.location, 'i');
  }
  return base;
}

function buildSortCriteria(sortBy: string): Record<string, 1 | -1> {
  if (sortBy === 'start_date') return { 'date.start_date': 1, createdAt: -1 };
  return { createdAt: -1 };
}

async function withCounts(opportunities: any[]) {
  return Promise.all(
    opportunities.map(async (opp) => {
      const [applicantCount, recruitCount] = await Promise.all([
        AppModel.countDocuments({
          opportunity: opp._id,
          status: { $in: ['pending', 'approved'] },
        }),
        RecModel.countDocuments({
          application: {
            $in: await AppModel.find({ opportunity: opp._id }).select('_id'),
          },
        }),
      ]);
      return { ...opp, applicantCount, recruitCount };
    }),
  );
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function createOpportunity(userId: string, body: CreateOpportunityInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  const roleIsOrg = ['organization', 'organisation', 'admin'].includes(user.role);
  const isOrganization = !!user.organization_profile || roleIsOrg;
  const isMentor = user.role === 'mentor';

  if (!isOrganization && !isMentor) throw new AppError(403, 'Only organisations or mentors can create opportunities.');
  if (isMentor && !body.organization_id) throw new AppError(400, 'Mentors must select an organisation.');
  if (roleIsOrg && !user.organization_profile && !body.organization_id)
    throw new AppError(400, 'Organisation profile not found. Please complete your profile first.');

  const organizationProfileId =
    (isMentor && body.organization_id)
      ? new mongoose.Types.ObjectId(body.organization_id)
      : user.role === 'admin' && body.organization_id
      ? new mongoose.Types.ObjectId(body.organization_id)
      : user.organization_profile;

  if (!organizationProfileId) throw new AppError(400, 'Organization profile ID is required.');

  const duplicate = await OppModel.findOne({
    title: body.title,
    organization_profile: organizationProfileId,
    location: body.location,
    'date.start_date': body.start_date ? new Date(body.start_date) : new Date(),
    'time.start_time': body.start_time || '09:00',
    is_deleted: { $ne: true },
  });
  if (duplicate) throw new AppError(409, 'Duplicate opportunity detected.');

  const opportunityData: Record<string, unknown> = {
    title: body.title,
    description: body.description,
    category: body.category,
    required_skills: body.required_skills,
    requirements: body.requirements || [],
    commitment_type: body.commitment_type,
    location: body.location,
    number_of_volunteers: body.number_of_volunteers,
    email_contact: body.email_contact || '',
    phone_contact: body.phone_contact,
    internal_reference: body.internal_reference,
    external_event_link: body.external_event_link,
    date: {
      start_date: body.start_date ? new Date(body.start_date) : new Date(),
      end_date: body.end_date ? new Date(body.end_date) : undefined,
    },
    time: {
      start_time: body.start_time || '09:00',
      end_time: body.end_time,
    },
    is_recurring: body.is_recurring || false,
    banner_img: body.banner_img?.trim() || '/images/banners/cover_placeholder.png',
    organization_profile: organizationProfileId,
    created_by: userId,
  };

  if (body.is_recurring && body.recurrence) {
    opportunityData.recurrence = {
      type: body.recurrence.type,
      days: body.recurrence.days || [],
      date_range: {
        start_date: new Date(body.recurrence.date_range.start_date),
        end_date: body.recurrence.date_range.end_date
          ? new Date(body.recurrence.date_range.end_date)
          : undefined,
      },
      time_range: body.recurrence.time_range,
      occurrences: body.recurrence.occurrences,
    };
  }

  const opportunity = await OppModel.create(opportunityData);

  if (isMentor && user._id) {
    await MentorModel.create({
      opportunity: opportunity._id,
      volunteer: user._id,
      organization_profile: organizationProfileId,
      assigned_by: user._id,
    });
  }

  return opportunity;
}

export async function getAllOpportunities(userId: string | undefined, input: ListOpportunitiesQuery) {
  const query = buildListQuery(input);

  if (input.sortBy === 'best_matches' && userId) {
    const user = await UserModel.findById(userId).populate('volunteer_profile');
    const profile = user?.volunteer_profile as any;
    if (profile) {
      const matchFilters: Record<string, unknown>[] = [];
      if (profile.interested_categories?.length) matchFilters.push({ category: { $in: profile.interested_categories } });
      if (profile.interested_on?.length) matchFilters.push({ required_skills: { $in: profile.interested_on } });
      if (profile.state) matchFilters.push({ location: new RegExp(profile.state, 'i') });
      if (profile.area) matchFilters.push({ location: new RegExp(profile.area, 'i') });
      if (profile.university) matchFilters.push({ title: new RegExp(profile.university, 'i') });
      if (matchFilters.length > 0) {
        const existingOr = query.$or as unknown;
        if (existingOr) {
          delete query.$or;
          query.$and = [{ $or: existingOr }, { $or: matchFilters }];
        } else {
          query.$or = matchFilters;
        }
      }
    }
  }

  const { page, limit } = input;
  const skip = (page - 1) * limit;
  const sort = buildSortCriteria(input.sortBy);
  const total = await OppModel.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const opportunities = await OppModel.find(query)
    .populate('organization_profile')
    .populate('created_by')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const data = await withCounts(opportunities);

  return { opportunities: data, total, totalPages, currentPage: page, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
}

export async function getPublicOpportunities(input: ListOpportunitiesQuery) {
  const query = buildListQuery(input);
  const { page, limit } = input;
  const skip = (page - 1) * limit;
  const sort = buildSortCriteria(input.sortBy);
  const total = await OppModel.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const opportunities = await OppModel.find(query)
    .populate('organization_profile')
    .populate('created_by')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const data = await Promise.all(
    opportunities.map(async (opp) => {
      const applicantCount = await AppModel.countDocuments({
        opportunity: opp._id,
        status: { $in: ['pending', 'approved'] },
      });
      return { ...opp, applicantCount };
    }),
  );

  return { opportunities: data, total, totalPages, currentPage: page, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
}

export async function getPublicOpportunity(id: string) {
  const opportunity = await OppModel.findOne({
    _id: id,
    is_deleted: { $ne: true },
    is_archived: { $ne: true },
  })
    .populate('organization_profile')
    .populate('created_by', 'name');

  if (!opportunity) throw new AppError(404, 'Opportunity not found.');
  return opportunity;
}

export async function getPublicOpportunitiesByMentor(userId: string) {
  const opportunities = await OppModel.find({
    created_by: userId,
    is_deleted: { $ne: true },
    is_archived: { $ne: true },
  })
    .populate('organization_profile')
    .sort({ createdAt: -1 })
    .lean();

  const data = await Promise.all(
    opportunities.map(async (opp) => {
      const applicantCount = await AppModel.countDocuments({
        opportunity: opp._id,
        status: { $in: ['pending', 'approved'] },
      });
      return { ...opp, applicantCount };
    }),
  );
  return data;
}

export async function getOrganizationOpportunities(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');
  if (!user.organization_profile) throw new AppError(404, 'Organisation profile not found.');

  const opportunities = await OppModel.find({
    organization_profile: user.organization_profile,
    is_deleted: { $ne: true },
  })
    .populate('organization_profile')
    .sort({ createdAt: -1 });

  const data = await withCounts(opportunities.map((o: any) => o.toObject()));
  return data;
}

export async function getMentorOpportunities(userId: string, input: ListOpportunitiesQuery) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  const assignments = await MentorModel.find({ volunteer: user._id }).populate('opportunity');
  const mentorOpportunityIds = assignments.map((a: any) => a.opportunity);

  if (mentorOpportunityIds.length === 0) {
    return { opportunities: [], total: 0, totalPages: 0, currentPage: input.page };
  }

  const query: Record<string, unknown> = {
    _id: { $in: mentorOpportunityIds },
    is_archived: { $ne: true },
    is_deleted: { $ne: true },
  };
  if (input.search) {
    query.$or = [
      { title: new RegExp(input.search, 'i') },
      { description: new RegExp(input.search, 'i') },
    ];
  }
  if (input.categories?.length) query.category = { $in: input.categories };
  if (input.commitmentType !== 'all') query.commitment_type = input.commitmentType;
  if (input.location) query.location = new RegExp(input.location, 'i');

  const { page, limit } = input;
  const skip = (page - 1) * limit;
  const total = await OppModel.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const opportunities = await OppModel.find(query)
    .populate('organization_profile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { opportunities, total, totalPages, currentPage: page };
}

export async function getMentorOpportunitiesCount(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) return { total: 0 };

  const assignments = await MentorModel.find({ volunteer: user._id });
  const ids = assignments.map((a: any) => a.opportunity);
  if (ids.length === 0) return { total: 0 };

  const total = await OppModel.countDocuments({
    _id: { $in: ids },
    is_archived: { $ne: true },
    is_deleted: { $ne: true },
  });
  return { total };
}

export async function getMentorOpportunitiesAll(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  const assignments = await MentorModel.find({ volunteer: user._id });
  const ids = assignments.map((a: any) => a.opportunity) as mongoose.Types.ObjectId[];
  if (ids.length === 0) return [];

  const opportunities = await OppModel.find({ _id: { $in: ids }, is_deleted: { $ne: true } })
    .populate('organization_profile')
    .sort({ createdAt: -1 });

  const data = await withCounts(opportunities.map((o: any) => o.toObject()));
  return data;
}

export async function getAllOpportunitiesCount() {
  const total = await OppModel.countDocuments({ is_deleted: { $ne: true }, is_archived: { $ne: true } });
  return { total };
}

export async function getOpportunity(id: string) {
  const opportunity = await OppModel.findOne({
    _id: id,
    is_deleted: { $ne: true },
  })
    .populate('organization_profile')
    .populate('created_by');

  if (!opportunity) throw new AppError(404, 'Opportunity not found.');
  return opportunity;
}

export async function updateOpportunity(userId: string, id: string, body: CreateOpportunityInput) {
  const existing = await OppModel.findOne({ _id: id, is_deleted: { $ne: true } });
  if (!existing) throw new AppError(404, 'Opportunity not found.');

  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  const isCreator = existing.created_by.toString() === userId;
  const isAdminOrOrg = ['admin', 'organization'].includes(user.role);
  if (!isCreator && !isAdminOrOrg) throw new AppError(403, "You don't have permission to update this opportunity.");

  const updateData: Record<string, unknown> = {
    title: body.title,
    description: body.description,
    category: body.category,
    required_skills: body.required_skills,
    requirements: body.requirements || [],
    commitment_type: body.commitment_type,
    location: body.location,
    number_of_volunteers: body.number_of_volunteers,
    email_contact: body.email_contact,
    phone_contact: body.phone_contact,
    internal_reference: body.internal_reference,
    external_event_link: body.external_event_link,
    date: {
      start_date: body.start_date ? new Date(body.start_date) : new Date(),
      end_date: body.end_date ? new Date(body.end_date) : undefined,
    },
    time: {
      start_time: body.start_time || '09:00',
      end_time: body.end_time,
    },
    is_recurring: body.is_recurring || false,
    banner_img: body.banner_img?.trim() || '/images/banners/cover_placeholder.png',
  };

  if (body.is_recurring && body.recurrence) {
    updateData.recurrence = {
      type: body.recurrence.type,
      days: body.recurrence.days || [],
      date_range: {
        start_date: new Date(body.recurrence.date_range.start_date),
        end_date: body.recurrence.date_range.end_date ? new Date(body.recurrence.date_range.end_date) : undefined,
      },
      time_range: body.recurrence.time_range,
      occurrences: body.recurrence.occurrences,
    };
  }

  const updated = await OppModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!updated) throw new AppError(500, 'Failed to update opportunity.');
  return updated;
}

export async function archiveOpportunity(userId: string, id: string) {
  const opportunity = await OppModel.findOne({ _id: id, is_deleted: { $ne: true } }).populate('organization_profile');
  if (!opportunity) throw new AppError(404, 'Opportunity not found.');

  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  const isCreator = opportunity.created_by.toString() === userId;
  const isPrivileged = ['admin', 'organization', 'mentor'].includes(user.role);
  if (!isCreator && !isPrivileged) throw new AppError(403, "You don't have permission to archive this opportunity.");

  const updated = await OppModel.findByIdAndUpdate(id, { is_archived: true }, { new: true });
  if (!updated) throw new AppError(500, 'Failed to archive opportunity.');

  await notificationService.sendOpportunityArchivedNotification(
    String(id),
    opportunity.title,
    (opportunity.organization_profile as any)._id.toString(),
    (opportunity.organization_profile as any).title,
    `Opportunity "${opportunity.title}" was archived.`,
  );

  return updated;
}

export async function unarchiveOpportunity(userId: string, id: string) {
  const opportunity = await OppModel.findOne({ _id: id, is_deleted: { $ne: true } }).populate('organization_profile');
  if (!opportunity) throw new AppError(404, 'Opportunity not found.');
  if (!opportunity.is_archived) throw new AppError(400, 'Opportunity is not archived.');

  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  const isCreator = opportunity.created_by.toString() === userId;
  const isPrivileged = ['admin', 'organization', 'mentor'].includes(user.role);
  if (!isCreator && !isPrivileged) throw new AppError(403, "You don't have permission to unarchive this opportunity.");

  const updated = await OppModel.findByIdAndUpdate(id, { is_archived: false }, { new: true });
  if (!updated) throw new AppError(500, 'Failed to unarchive opportunity.');

  await notificationService.sendOpportunityUnarchivedNotification(
    String(id),
    opportunity.title,
    (opportunity.organization_profile as any)._id.toString(),
    (opportunity.organization_profile as any).title,
    `Opportunity "${opportunity.title}" has been restored from the archive.`,
  );

  return { opportunity: updated };
}

export async function deleteOpportunity(userId: string, id: string) {
  const opportunity = await OppModel.findById(id);
  if (!opportunity) throw new AppError(404, 'Opportunity not found.');
  if (opportunity.is_deleted) throw new AppError(400, 'Opportunity is already deleted.');

  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found.');

  const isCreator = opportunity.created_by.toString() === userId;
  const isPrivileged = ['admin', 'organization', 'mentor'].includes(user.role);
  if (!isCreator && !isPrivileged) throw new AppError(403, "You don't have permission to delete this opportunity.");

  const result = await OppModel.findByIdAndUpdate(id, { is_deleted: true }, { new: true, runValidators: false });
  if (!result) throw new AppError(500, 'Failed to delete opportunity.');
  return null;
}