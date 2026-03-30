import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router } from "@/server/trpc";
import { protectedProcedure } from "@/server/middlewares/with-auth";
import connectDB from "@/server/config/mongoose";
import { JwtPayload } from "jsonwebtoken";

import User from "@/server/db/models/user";
import Opportunity from "@/server/db/models/opportunity";
import VolunteerApplication from "@/server/db/models/volunteer-application";
import OpportunityMentor from "@/server/db/models/opportunity-mentor";
import RosterShift from "@/server/db/models/roster-shift";

const rosterVolunteerStatusSchema = z.enum(["pending", "confirmed", "absent"]);

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((w) => w.trim()[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "ME"
  );
}

async function getAccessFlags({
  opportunityId,
  userId,
}: {
  opportunityId: string;
  userId: string;
}) {
  const opportunity = await Opportunity.findOne({
    _id: opportunityId,
    is_deleted: { $ne: true },
    is_archived: { $ne: true },
  }).lean() as any;

  if (!opportunity) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Opportunity not found",
    });
  }

  const user = (await User.findById(userId).lean()) as any;
  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  const isOrgAdminOrOrg =
    user.role === "admin" ||
    user.role === "organization" ||
    user.role === "organisation";

  const isOrgUser =
    isOrgAdminOrOrg &&
    (!!user.organization_profile &&
      user.organization_profile.toString() ===
        (opportunity.organization_profile as any).toString());

  const isMentor = await OpportunityMentor.exists({
    opportunity: opportunityId,
    volunteer: userId,
  });

  const isApprovedVolunteer = await VolunteerApplication.exists({
    opportunity: opportunityId,
    volunteer: userId,
    status: "approved",
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
        name: v?.name ?? "Volunteer",
        initials: v?.initials ?? getInitials(v?.name ?? "Volunteer"),
        skills: v?.skills ?? [],
        status: a.status,
      };
    }),
  };
}

export const rosterRouter = router({
  getRosterShifts: protectedProcedure
    .input(z.object({ opportunityId: z.string() }))
    .query(async ({ ctx, input }) => {
      await connectDB();

      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      }

      const { canAccessRoster } = await getAccessFlags({
        opportunityId: input.opportunityId,
        userId: sessionUser.id,
      });

      if (!canAccessRoster) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to view roster shifts",
        });
      }

      const shifts = await RosterShift.find({
        opportunity: input.opportunityId,
      })
        .sort({ date: 1, startTime: 1 })
        .lean();

      const volunteerIds = Array.from(
        new Set(
          shifts.flatMap((s: any) =>
            (s.assignedVolunteers ?? []).map((a: any) =>
              a.volunteer.toString()
            )
          )
        )
      );

      const volunteers = volunteerIds.length
        ? await User.find({ _id: { $in: volunteerIds } })
            .populate("volunteer_profile", "interested_on")
            .select("name volunteer_profile")
            .lean()
        : [];

      const volunteersById: Record<
        string,
        { name: string; skills: string[]; initials: string }
      > = {};

      volunteers.forEach((v: any) => {
        const skills = v.volunteer_profile?.interested_on ?? [];
        volunteersById[v._id.toString()] = {
          name: v.name ?? "Volunteer",
          skills,
          initials: getInitials(v.name ?? "Volunteer"),
        };
      });

      return shifts.map((s: any) =>
        mapShiftForClient({
          shift: s,
          opportunityId: input.opportunityId,
          volunteersById,
        })
      );
    }),

  createShift: protectedProcedure
    .input(
      z.object({
        opportunityId: z.string(),
        title: z.string().min(1),
        date: z.string().min(1),
        startTime: z.string().min(1),
        endTime: z.string().min(1),
        role: z.string().min(1),
        maxVolunteers: z.number().int().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      }

      const { canManageRoster } = await getAccessFlags({
        opportunityId: input.opportunityId,
        userId: sessionUser.id,
      });

      if (!canManageRoster) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create shifts",
        });
      }

      const created = await RosterShift.create({
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
    }),

  updateShift: protectedProcedure
    .input(
      z.object({
        shiftId: z.string(),
        title: z.string().min(1),
        date: z.string().min(1),
        startTime: z.string().min(1),
        endTime: z.string().min(1),
        role: z.string().min(1),
        maxVolunteers: z.number().int().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      }

      const shift = await RosterShift.findById(input.shiftId);
      if (!shift) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Shift not found" });
      }

      const { canManageRoster } = await getAccessFlags({
        opportunityId: shift.opportunity.toString(),
        userId: sessionUser.id,
      });

      if (!canManageRoster) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update shifts",
        });
      }

      shift.title = input.title;
      shift.date = input.date;
      shift.startTime = input.startTime;
      shift.endTime = input.endTime;
      shift.role = input.role;
      shift.maxVolunteers = input.maxVolunteers;
      await shift.save();

      return { success: true };
    }),

  deleteShift: protectedProcedure
    .input(z.object({ shiftId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      }

      const shift = await RosterShift.findById(input.shiftId);
      if (!shift) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Shift not found" });
      }

      const { canManageRoster } = await getAccessFlags({
        opportunityId: shift.opportunity.toString(),
        userId: sessionUser.id,
      });

      if (!canManageRoster) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete shifts",
        });
      }

      await shift.deleteOne();
      return { success: true };
    }),

  assignVolunteer: protectedProcedure
    .input(
      z.object({
        shiftId: z.string(),
        volunteerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      }

      const shift = await RosterShift.findById(input.shiftId);
      if (!shift) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Shift not found" });
      }

      const { canManageRoster } = await getAccessFlags({
        opportunityId: shift.opportunity.toString(),
        userId: sessionUser.id,
      });

      if (!canManageRoster) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to assign volunteers",
        });
      }

      const volunteerApproved = await VolunteerApplication.findOne({
        opportunity: shift.opportunity.toString(),
        volunteer: input.volunteerId,
        status: "approved",
      });

      if (!volunteerApproved) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Volunteer must be approved to be assigned",
        });
      }

      const alreadyAssigned = shift.assignedVolunteers.some(
        (a: any) => a.volunteer.toString() === input.volunteerId
      );

      if (alreadyAssigned) return { success: true };

      if (shift.assignedVolunteers.length >= shift.maxVolunteers) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Shift is full",
        });
      }

      shift.assignedVolunteers.push({
        volunteer: input.volunteerId as any,
        status: "pending",
      });
      await shift.save();
      return { success: true };
    }),

  unassignVolunteer: protectedProcedure
    .input(
      z.object({
        shiftId: z.string(),
        volunteerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      }

      const shift = await RosterShift.findById(input.shiftId);
      if (!shift) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Shift not found" });
      }

      const { canManageRoster } = await getAccessFlags({
        opportunityId: shift.opportunity.toString(),
        userId: sessionUser.id,
      });

      if (!canManageRoster) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to unassign volunteers",
        });
      }

      shift.assignedVolunteers = shift.assignedVolunteers.filter(
        (a: any) => a.volunteer.toString() !== input.volunteerId
      );
      await shift.save();
      return { success: true };
    }),

  updateVolunteerStatus: protectedProcedure
    .input(
      z.object({
        shiftId: z.string(),
        volunteerId: z.string(),
        status: rosterVolunteerStatusSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      }

      const shift = await RosterShift.findById(input.shiftId);
      if (!shift) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Shift not found" });
      }

      const { canManageRoster } = await getAccessFlags({
        opportunityId: shift.opportunity.toString(),
        userId: sessionUser.id,
      });

      if (!canManageRoster) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update volunteer status",
        });
      }

      const assigned = shift.assignedVolunteers.find(
        (a: any) => a.volunteer.toString() === input.volunteerId
      );

      if (!assigned) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Volunteer not assigned to this shift",
        });
      }

      assigned.status = input.status;
      await shift.save();
      return { success: true };
    }),

  signupForShift: protectedProcedure
    .input(z.object({ shiftId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      }

      const shift = await RosterShift.findById(input.shiftId);
      if (!shift) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Shift not found" });
      }

      const { canAccessRoster } = await getAccessFlags({
        opportunityId: shift.opportunity.toString(),
        userId: sessionUser.id,
      });

      if (!canAccessRoster) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be approved to sign up for shifts",
        });
      }

      const volunteerId = sessionUser.id;
      const alreadyJoined = shift.assignedVolunteers.some(
        (a: any) => a.volunteer.toString() === volunteerId
      );
      if (alreadyJoined) return { success: true };

      if (shift.assignedVolunteers.length >= shift.maxVolunteers) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Shift is full" });
      }

      shift.assignedVolunteers.push({
        volunteer: volunteerId as any,
        status: "pending",
      });
      await shift.save();
      return { success: true };
    }),

  withdrawFromShift: protectedProcedure
    .input(z.object({ shiftId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await connectDB();
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      }

      const shift = await RosterShift.findById(input.shiftId);
      if (!shift) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Shift not found" });
      }

      const { canAccessRoster } = await getAccessFlags({
        opportunityId: shift.opportunity.toString(),
        userId: sessionUser.id,
      });

      if (!canAccessRoster) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to withdraw",
        });
      }

      const volunteerId = sessionUser.id;
      shift.assignedVolunteers = shift.assignedVolunteers.filter(
        (a: any) => a.volunteer.toString() !== volunteerId
      );
      await shift.save();
      return { success: true };
    }),
});

