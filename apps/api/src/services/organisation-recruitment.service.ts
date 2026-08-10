/* eslint-disable @typescript-eslint/no-explicit-any */
import User from '../db/models/user';
import OrganisationRecruitment from '../db/models/organisation-recruitment';
import VolunteerApplication from '../db/models/volunteer-application';
import { AppError } from '../lib/errors.js';
import {
  RecruitApplicantInput,
  RecruitedApplicantsQuery,
} from '../validators/organisation-recruitment.validator.js';
import { formatText } from '../utils/formatText.js';

// Cast models to avoid Mongoose union-type generic issues with .find() overloads
const UserModel = User as any;
const RecModel = OrganisationRecruitment as any;
const AppModel = VolunteerApplication as any;

export async function getRecruitmentStatus(input: RecruitApplicantInput) {
  const recruitment = await RecModel.findOne({
    application: input.applicationId,
  });

  return { isRecruited: !!recruitment };
}

export async function recruitApplicant(userId: string, input: RecruitApplicantInput) {
  const recruiter = await UserModel.findById(userId);
  if (!recruiter) throw new AppError(404, 'Recruiter not found.');

  const application = await AppModel.findById(input.applicationId);
  if (!application) throw new AppError(404, 'Application not found.');

  const existingRecruitment = await RecModel.findOne({
    application: input.applicationId,
  });

  if (existingRecruitment) {
    throw new AppError(400, 'Applicant has already been recruited for this opportunity.');
  }

  const organisationRecruitment = await RecModel.create({
    application: input.applicationId,
    recruited_by: recruiter._id,
  });

  await AppModel.findByIdAndUpdate(
    input.applicationId,
    { status: 'approved' },
    { new: true },
  );

  return organisationRecruitment;
}

export async function getRecruitedApplicants(_userId: string, input: RecruitedApplicantsQuery) {
  const matchCondition = input.opportunityId
    ? { opportunity: input.opportunityId }
    : {};

  const recruitedApplications = await RecModel.find()
    .populate({
      path: 'application',
      match: matchCondition,
      populate: [
        {
          path: 'volunteer',
          select: 'name email image',
          populate: {
            path: 'volunteer_profile',
            select: 'state area bio interested_on completed_projects availability',
          },
        },
        {
          path: 'opportunity',
          select: 'title description category location commitment_type is_deleted is_archived',
        },
      ],
    })
    .sort({ createdAt: -1 })
    .lean();

  const validRecruitedApplications = recruitedApplications.filter(
    (recruitment: any) => {
      if (!recruitment.application || !recruitment.application.volunteer) return false;
      const opp = recruitment.application.opportunity;
      if (!opp) return false;
      if (opp.is_deleted === true) return false;
      if (opp.is_archived === true) return false;
      return true;
    },
  );

  const transformedData = validRecruitedApplications.map((recruitment: any) => {
    const app = recruitment as unknown as {
      application: {
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
        opportunity?: {
          _id: { toString(): string };
          title?: string;
          description?: string;
          category?: string[];
          location?: string;
          commitment_type?: string;
        };
      };
    };

    const state = app.application.volunteer.volunteer_profile?.state || '';
    const area = app.application.volunteer.volunteer_profile?.area || '';
    const location = formatText(area, state);

    return {
      id: app.application.volunteer._id.toString(),
      name: app.application.volunteer.name || '',
      email: app.application.volunteer.email || '',
      profileImg: app.application.volunteer.image || null,
      location: location,
      bio: app.application.volunteer.volunteer_profile?.bio || '',
      skills: app.application.volunteer.volunteer_profile?.interested_on || [],
      completedProjects:
        app.application.volunteer.volunteer_profile?.completed_projects || 0,
      availability:
        app.application.volunteer.volunteer_profile?.availability || '',
      applicationId: app.application._id.toString(),
      opportunity: app.application.opportunity
        ? {
            id: app.application.opportunity._id.toString(),
            title: app.application.opportunity.title || '',
            description: app.application.opportunity.description || '',
            category: app.application.opportunity.category || [],
            location: app.application.opportunity.location || '',
            commitment_type: app.application.opportunity.commitment_type || '',
          }
        : null,
    } as const;
  });

  const uniqueRecruits = Array.from(
    new Map(transformedData.map((item) => [item.id, item])).values(),
  );

  return uniqueRecruits;
}