/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../db/models/user';
import OrganizationProfile from '../db/models/organization-profile';
import MentorInvitation from '../db/models/mentor-invitation';
import OpportunityMentor from '../db/models/opportunity-mentor';
import Opportunity from '../db/models/opportunity';
import { AppError } from '../lib/errors.js';
import {
  InviteMentorInput,
  AcceptInvitationInput,
  MentorAssignmentInput,
  OpportunityMentorsQuery,
  OrganizationMentorsQuery,
} from '../validators/organization-mentors.validator.js';

// Cast models to avoid Mongoose union-type generic issues with .find() overloads
const UserModel = User as any;
const OrgProfileModel = OrganizationProfile as any;
const InvitationModel = MentorInvitation as any;
const OppMentorModel = OpportunityMentor as any;
const OppModel = Opportunity as any;

export async function inviteMentor(userId: string, input: InviteMentorInput) {
  const inviter = await UserModel.findById(userId);
  if (!inviter || (inviter.role !== 'admin' && inviter.role !== 'mentor')) {
    throw new AppError(403, 'Only admins and mentors can invite mentors.');
  }

  const organization = await OrgProfileModel.findById(input.organizationId);
  if (!organization) {
    throw new AppError(404, 'Organisation not found.');
  }

  const existingUser = await UserModel.findOne({ email: input.email });
  if (existingUser) {
    throw new AppError(400, 'A user with this email already exists.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);

  await InvitationModel.create({
    organization_profile: input.organizationId,
    invited_by: inviter._id,
    email: input.email,
    name: input.name,
    token,
    expires,
  });

  return { message: 'Mentor invitation sent successfully' };
}

export async function acceptInvitation(input: AcceptInvitationInput) {
  const invitation = await InvitationModel.findOne({
    token: input.token,
    expires: { $gt: new Date() },
  });

  if (!invitation) {
    throw new AppError(404, 'Invalid or expired invitation token.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(input.password, salt);

  await UserModel.create({
    email: invitation.email,
    name: input.name,
    role: 'mentor',
    is_verified: true,
    provider: 'credentials',
    password: hashedPassword,
    organization_profile: invitation.organization_profile,
  });

  await InvitationModel.deleteOne({ _id: invitation._id });

  return { message: 'Invitation accepted successfully' };
}

export async function markAsMentor(userId: string, input: MentorAssignmentInput) {
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) {
    throw new AppError(404, 'Current user not found.');
  }

  const isAdminOrMentor =
    currentUser.role === 'admin' || currentUser.role === 'mentor';

  let isOpportunityMentor = false;
  if (!isAdminOrMentor) {
    const mentorAssignment = await OppMentorModel.findOne({
      opportunity: input.opportunityId,
      volunteer: currentUser._id,
    });
    isOpportunityMentor = !!mentorAssignment;
  }

  if (!isAdminOrMentor && !isOpportunityMentor) {
    throw new AppError(
      403,
      'Only admins, mentors, or opportunity mentors can mark volunteers as mentors.',
    );
  }

  const opportunity = await OppModel.findById(input.opportunityId);
  if (!opportunity) {
    throw new AppError(404, 'Opportunity not found.');
  }

  let hasOrganizationAccess = false;

  if (isAdminOrMentor) {
    hasOrganizationAccess =
      currentUser.organization_profile?.toString() ===
      opportunity.organization_profile.toString();
  } else if (isOpportunityMentor) {
    const mentorAssignment = await OppMentorModel.findOne({
      opportunity: input.opportunityId,
      volunteer: currentUser._id,
    });
    hasOrganizationAccess =
      mentorAssignment?.organization_profile?.toString() ===
      opportunity.organization_profile.toString();
  }

  if (!hasOrganizationAccess) {
    throw new AppError(
      403,
      'You can only mark volunteers as mentors for opportunities within your organization.',
    );
  }

  const volunteer = await UserModel.findById(input.volunteerId);
  if (!volunteer) {
    throw new AppError(404, 'Volunteer not found.');
  }

  const existingMentorAssignment = await OppMentorModel.findOne({
    opportunity: input.opportunityId,
    volunteer: input.volunteerId,
  });

  if (existingMentorAssignment) {
    throw new AppError(400, 'This volunteer is already a mentor for this opportunity.');
  }

  const mentorAssignment = await OppMentorModel.create({
    opportunity: input.opportunityId,
    volunteer: input.volunteerId,
    organization_profile: opportunity.organization_profile,
    assigned_by: currentUser._id,
    assigned_at: new Date(),
  });

  return {
    message: 'Volunteer has been successfully marked as mentor for this opportunity',
    mentorAssignment: {
      id: mentorAssignment._id,
      opportunityId: mentorAssignment.opportunity,
      volunteerId: mentorAssignment.volunteer,
      assignedAt: mentorAssignment.assigned_at,
    },
  };
}

export async function removeMentor(userId: string, input: MentorAssignmentInput) {
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) {
    throw new AppError(404, 'Current user not found.');
  }

  const isAdminOrMentor =
    currentUser.role === 'admin' || currentUser.role === 'mentor';

  let isOpportunityMentor = false;
  if (!isAdminOrMentor) {
    const mentorAssignment = await OppMentorModel.findOne({
      opportunity: input.opportunityId,
      volunteer: currentUser._id,
    });
    isOpportunityMentor = !!mentorAssignment;
  }

  if (!isAdminOrMentor && !isOpportunityMentor) {
    throw new AppError(
      403,
      'Only admins, mentors, or opportunity mentors can remove mentors.',
    );
  }

  const opportunity = await OppModel.findById(input.opportunityId);
  if (!opportunity) {
    throw new AppError(404, 'Opportunity not found.');
  }

  let hasOrganizationAccess = false;

  if (isAdminOrMentor) {
    hasOrganizationAccess =
      currentUser.organization_profile?.toString() ===
      opportunity.organization_profile.toString();
  } else if (isOpportunityMentor) {
    const mentorAssignment = await OppMentorModel.findOne({
      opportunity: input.opportunityId,
      volunteer: currentUser._id,
    });
    hasOrganizationAccess =
      mentorAssignment?.organization_profile?.toString() ===
      opportunity.organization_profile.toString();
  }

  if (!hasOrganizationAccess) {
    throw new AppError(
      403,
      'You can only remove mentors for opportunities within your organization.',
    );
  }

  const mentorAssignment = await OppMentorModel.findOneAndDelete({
    opportunity: input.opportunityId,
    volunteer: input.volunteerId,
  });

  if (!mentorAssignment) {
    throw new AppError(404, 'Mentor assignment not found.');
  }

  return { message: 'Mentor has been successfully removed from this opportunity' };
}

export async function toggleMentor(userId: string, input: MentorAssignmentInput) {
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) {
    throw new AppError(404, 'Current user not found.');
  }

  const isAdminOrMentor =
    currentUser.role === 'admin' || currentUser.role === 'mentor';

  let isOpportunityMentor = false;
  if (!isAdminOrMentor) {
    const mentorAssignment = await OppMentorModel.findOne({
      opportunity: input.opportunityId,
      volunteer: currentUser._id,
    });
    isOpportunityMentor = !!mentorAssignment;
  }

  if (!isAdminOrMentor && !isOpportunityMentor) {
    throw new AppError(
      403,
      'Only admins, mentors, or opportunity mentors can toggle mentor status.',
    );
  }

  const opportunity = await OppModel.findById(input.opportunityId);
  if (!opportunity) {
    throw new AppError(404, 'Opportunity not found.');
  }

  let hasOrganizationAccess = false;

  if (isAdminOrMentor) {
    hasOrganizationAccess =
      currentUser.organization_profile?.toString() ===
      opportunity.organization_profile.toString();
  } else if (isOpportunityMentor) {
    const mentorAssignment = await OppMentorModel.findOne({
      opportunity: input.opportunityId,
      volunteer: currentUser._id,
    });
    hasOrganizationAccess =
      mentorAssignment?.organization_profile?.toString() ===
      opportunity.organization_profile.toString();
  }

  if (!hasOrganizationAccess) {
    throw new AppError(
      403,
      'You can only toggle mentor status for opportunities within your organization.',
    );
  }

  const volunteer = await UserModel.findById(input.volunteerId);
  if (!volunteer) {
    throw new AppError(404, 'Volunteer not found.');
  }

  const existingMentorAssignment = await OppMentorModel.findOne({
    opportunity: input.opportunityId,
    volunteer: input.volunteerId,
  });

  if (existingMentorAssignment) {
    await OppMentorModel.findOneAndDelete({
      opportunity: input.opportunityId,
      volunteer: input.volunteerId,
    });

    return {
      message: 'Mentor has been successfully removed from this opportunity',
      action: 'removed',
    };
  } else {
    const mentorAssignment = await OppMentorModel.create({
      opportunity: input.opportunityId,
      volunteer: input.volunteerId,
      organization_profile: opportunity.organization_profile,
      assigned_by: currentUser._id,
      assigned_at: new Date(),
    });

    return {
      message: 'Volunteer has been successfully marked as mentor for this opportunity',
      action: 'added',
      mentorAssignment: {
        id: mentorAssignment._id,
        opportunityId: mentorAssignment.opportunity,
        volunteerId: mentorAssignment.volunteer,
        assignedAt: mentorAssignment.assigned_at,
      },
    };
  }
}

export async function getOpportunityMentors(
  _userId: string,
  input: OpportunityMentorsQuery,
) {
  const mentors = await OppMentorModel.find({
    opportunity: input.opportunityId,
  })
    .populate('volunteer', 'name email')
    .populate('assigned_by', 'name email')
    .sort({ assigned_at: -1 });

  return mentors;
}

export async function getMentors(_userId: string, input: OrganizationMentorsQuery) {
  const mentors = await UserModel.find({
    organization_profile: input.organizationId,
    role: 'mentor',
  }).select('name email');

  return mentors;
}