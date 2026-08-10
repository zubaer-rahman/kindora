import { z } from 'zod';

export const rosterVolunteerStatusSchema = z.enum(['pending', 'confirmed', 'absent']);

export const getRosterShiftsParamsSchema = z.object({
  opportunityId: z.string(),
});

export const createShiftSchema = z.object({
  opportunityId: z.string(),
  title: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  role: z.string().min(1),
  maxVolunteers: z.number().int().min(1),
});

export const shiftIdParamsSchema = z.object({
  shiftId: z.string(),
});

export const updateShiftSchema = z.object({
  shiftId: z.string(),
  title: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  role: z.string().min(1),
  maxVolunteers: z.number().int().min(1),
});

export const assignVolunteerSchema = z.object({
  shiftId: z.string(),
  volunteerId: z.string(),
});

export const updateVolunteerStatusSchema = z.object({
  shiftId: z.string(),
  volunteerId: z.string(),
  status: rosterVolunteerStatusSchema,
});

export const signupForShiftSchema = z.object({
  shiftId: z.string(),
});

export type GetRosterShiftsParams = z.infer<typeof getRosterShiftsParamsSchema>;
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type ShiftIdParams = z.infer<typeof shiftIdParamsSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
export type AssignVolunteerInput = z.infer<typeof assignVolunteerSchema>;
export type UpdateVolunteerStatusInput = z.infer<typeof updateVolunteerStatusSchema>;
export type SignupForShiftInput = z.infer<typeof signupForShiftSchema>;