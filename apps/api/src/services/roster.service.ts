/* eslint-disable @typescript-eslint/no-explicit-any */
import User from '../db/models/user';
import Opportunity from '../db/models/opportunity';
import VolunteerApplication from '../db/models/volunteer-application';
import OpportunityMentor from '../db/models/opportunity-mentor';
import RosterShift from '../db/models/roster-shift';
import { AppError } from '../lib/errors.js';
import {
  GetRosterShiftsParams,
  CreateShiftInput,
  ShiftIdParams,
  UpdateShiftInput,
  AssignVolunteerInput,
  UpdateVolunteerStatusInput,
  SignupForShiftInput,
} from '../validators/roster.validator.js';

// Cast models to avoid Mongoose union-type generic issues with .find() overloads
const UserModel = User as any;
const OpportunityModel = Opportunity as any;
const VolunteerApplicationModel = VolunteerApplication as any;
const OpportunityMentorModel = OpportunityMentor as any;
const RosterShiftModel = RosterShift as any;

export async function getRosterShifts(
  userId: string,
  input: GetRosterShiftsParams,
) {
  const { canAccessRoster } = await getAccessFlags({
    opportunityId: input.opportunityId,
    userId,
  });

  if (!canAccessRoster) {
    throw new AppError(403, "You don't have access to view roster shifts");
  }

  const shifts = await RosterShiftModel.find({
    opportunity: input.opportunityId,
  })
    .sort({ date: 1, startTime: 1 })
    .lean();

  const volunteerIds = Array.from(
    new Set(
      shifts.flatMap((s: any) =>
        (s.assignedVolunteers ?? []).map((a: any) => a.volunteer.toString()),
      ),
    ),
  );

  const volunteers = volunteerIds.length
    ? await UserModel.find({ _id: { $in: volunteerIds } })
        .populate('volunteer_profile', 'interested_on')
        .select('name volunteer_profile')
        .lean()
    : [];

  const volunteersById: Record<
    string,
    { name: string; skills: string[]; initials: string }
  > = {};

  volunteers.forEach((v: any) => {
    const skills = v.volunteer_profile?.interested_on ?? [];
    volunteersById[v._id.toString()] = {
      name: v.name ?? 'Volunteer',
      skills,
      initials: getInitials(v.name ?? 'Volunteer'),
    };
  });

  return shifts.map((s: any) =>
    mapShiftForClient({
      shift: s,
      opportunityId: input.opportunityId,
      volunteersById,
    }),
  );
}

export async function createShift(userId: string, input: CreateShiftInput) {
  const { canManageRoster } = await getAccessFlags({
    opportunityId: input.opportunityId,
    userId,
  });

  if (!canManageRoster) {
    throw new AppError(403, "You don't have permission to create shifts");
  }

  const created = await RosterShiftModel.create({
    opportunity: input.opportunityId,
    title: input.title,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    role: input.role,
    maxVolunteers: input.maxVolunteers,
    assignedVolunteers: [],
  });

  return {
    id: created._id.toString(),
    postId: input.opportunityId,
    title: created.title,
    date: created.date,
    startTime: created.startTime,
    endTime: created.endTime,
    role: created.role,
    maxVolunteers: created.maxVolunteers,
    assignedVolunteers: [],
  };
}

export async function updateShift(userId: string, input: UpdateShiftInput) {
  const shift = await RosterShiftModel.findById(input.shiftId);
  if (!shift) {
    throw new AppError(404, 'Shift not found');
  }

  const { canManageRoster } = await getAccessFlags({
    opportunityId: shift.opportunity.toString(),
    userId,
  });

  if (!canManageRoster) {
    throw new AppError(403, "You don't have permission to update shifts");
  }

  shift.title = input.title;
  shift.date = input.date;
  shift.startTime = input.startTime;
  shift.endTime = input.endTime;
  shift.role = input.role;
  shift.maxVolunteers = input.maxVolunteers;
  await shift.save();

  return { success: true };
}

export async function deleteShift(userId: string, input: ShiftIdParams) {
  const shift = await RosterShiftModel.findById(input.shiftId);
  if (!shift) {
    throw new AppError(404, 'Shift not found');
  }

  const { canManageRoster } = await getAccessFlags({
    opportunityId: shift.opportunity.toString(),
    userId,
  });

  if (!canManageRoster) {
    throw new AppError(403, "You don't have permission to delete shifts");
  }

  await shift.deleteOne();
  return { success: true };
}

export async function assignVolunteer(
  userId: string,
  input: AssignVolunteerInput,
) {
  const shift = await RosterShiftModel.findById(input.shiftId);
  if (!shift) {
    throw new AppError(404, 'Shift not found');
  }

  const { canManageRoster } = await getAccessFlags({
    opportunityId: shift.opportunity.toString(),
    userId,
  });

  if (!canManageRoster) {
    throw new AppError(403, "You don't have permission to assign volunteers");
  }

  const volunteerApproved = await VolunteerApplicationModel.findOne({
    opportunity: shift.opportunity.toString(),
    volunteer: input.volunteerId,
    status: 'approved',
  });

  if (!volunteerApproved) {
    throw new AppError(403, 'Volunteer must be approved to be assigned');
  }

  const alreadyAssigned = shift.assignedVolunteers.some(
    (a: any) => a.volunteer.toString() === input.volunteerId,
  );

  if (alreadyAssigned) return { success: true };

  if (shift.assignedVolunteers.length >= shift.maxVolunteers) {
    throw new AppError(400, 'Shift is full');
  }

  shift.assignedVolunteers.push({
    volunteer: input.volunteerId as any,
    status: 'pending',
  });
  await shift.save();
  return { success: true };
}

export async function unassignVolunteer(
  userId: string,
  input: AssignVolunteerInput,
) {
  const shift = await RosterShiftModel.findById(input.shiftId);
  if (!shift) {
    throw new AppError(404, 'Shift not found');
  }

  const { canManageRoster } = await getAccessFlags({
    opportunityId: shift.opportunity.toString(),
    userId,
  });

  if (!canManageRoster) {
    throw new AppError(403, "You don't have permission to unassign volunteers");
  }

  shift.assignedVolunteers = shift.assignedVolunteers.filter(
    (a: any) => a.volunteer.toString() !== input.volunteerId,
  );
  await shift.save();
  return { success: true };
}

export async function updateVolunteerStatus(
  userId: string,
  input: UpdateVolunteerStatusInput,
) {
  const shift = await RosterShiftModel.findById(input.shiftId);
  if (!shift) {
    throw new AppError(404, 'Shift not found');
  }

  const { canManageRoster } = await getAccessFlags({
    opportunityId: shift.opportunity.toString(),
    userId,
  });

  if (!canManageRoster) {
    throw new AppError(
      403,
      "You don't have permission to update volunteer status",
    );
  }

  const assigned = shift.assignedVolunteers.find(
    (a: any) => a.volunteer.toString() === input.volunteerId,
  );

  if (!assigned) {
    throw new AppError(404, 'Volunteer not assigned to this shift');
  }

  assigned.status = input.status;
  await shift.save();
  return { success: true };
}

export async function signupForShift(
  userId: string,
  input: SignupForShiftInput,
) {
  const shift = await RosterShiftModel.findById(input.shiftId);
  if (!shift) {
    throw new AppError(404, 'Shift not found');
  }

  const { canAccessRoster } = await getAccessFlags({
    opportunityId: shift.opportunity.toString(),
    userId,
  });

  if (!canAccessRoster) {
    throw new AppError(403, 'You must be approved to sign up for shifts');
  }

  const alreadyJoined = shift.assignedVolunteers.some(
    (a: any) => a.volunteer.toString() === userId,
  );
  if (alreadyJoined) return { success: true };

  if (shift.assignedVolunteers.length >= shift.maxVolunteers) {
    throw new AppError(400, 'Shift is full');
  }

  shift.assignedVolunteers.push({
    volunteer: userId as any,
    status: 'pending',
  });
  await shift.save();
  return { success: true };
}

export async function withdrawFromShift(
  userId: string,
  input: SignupForShiftInput,
) {
  const shift = await RosterShiftModel.findById(input.shiftId);
  if (!shift) {
    throw new AppError(404, 'Shift not found');
  }

  const { canAccessRoster } = await getAccessFlags({
    opportunityId: shift.opportunity.toString(),
    userId,
  });

  if (!canAccessRoster) {
    throw new AppError(403, "You don't have access to withdraw");
  }

  shift.assignedVolunteers = shift.assignedVolunteers.filter(
    (a: any) => a.volunteer.toString() !== userId,
  );
  await shift.save();
  return { success: true };
}

async function getAccessFlags({
  opportunityId,
  userId,
}: {
  opportunityId: string;
  userId: string;
}) {
  const opportunity = (await OpportunityModel.findOne({
    _id: opportunityId,
    is_deleted: { $ne: true },
    is_archived: { $ne: true },
  }).lean()) as any;

  if (!opportunity) {
    throw new AppError(404, 'Opportunity not found');
  }

  const user = (await UserModel.findById(userId).lean()) as any;
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const isOrgAdminOrOrg =
    user.role === 'admin' ||
    user.role === 'organization' ||
    user.role === 'organisation';

  const isOrgUser =
    isOrgAdminOrOrg &&
    !!user.organization_profile &&
    user.organization_profile.toString() ===
      opportunity.organization_profile.toString();

  const isMentor = await OpportunityMentorModel.exists({
    opportunity: opportunityId,
    volunteer: userId,
  });

  const isApprovedVolunteer = await VolunteerApplicationModel.exists({
    opportunity: opportunityId,
    volunteer: userId,
    status: 'approved',
  });

  const canManageRoster = isOrgUser || isMentor;
  const canAccessRoster = canManageRoster || !!isApprovedVolunteer;

  return {
    opportunity,
    user,
    canManageRoster,
    canAccessRoster,
  };
}

function mapShiftForClient({
  shift,
  opportunityId,
  volunteersById,
}: {
  shift: any;
  opportunityId: string;
  volunteersById: Record<
    string,
    { name: string; skills: string[]; initials: string }
  >;
}) {
  return {
    id: shift._id.toString(),
    postId: opportunityId,
    title: shift.title,
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    role: shift.role,
    maxVolunteers: shift.maxVolunteers,
    assignedVolunteers: (shift.assignedVolunteers ?? []).map((a: any) => {
      const v = volunteersById[a.volunteer?.toString?.() ?? a.volunteer];
      return {
        id: a.volunteer.toString(),
        name: v?.name ?? 'Volunteer',
        initials: v?.initials ?? getInitials(v?.name ?? 'Volunteer'),
        skills: v?.skills ?? [],
        status: a.status,
      };
    }),
  };
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .map(w => w.trim()[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'ME'
  );
}