import { z } from 'zod';

export const inviteMentorSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  organizationId: z.string().min(1, 'Organisation ID is required'),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const mentorAssignmentSchema = z.object({
  volunteerId: z.string().min(1, 'Volunteer ID is required'),
  opportunityId: z.string().min(1, 'Opportunity ID is required'),
});

export const opportunityMentorsQuerySchema = z.object({
  opportunityId: z.string(),
});

export const organizationMentorsQuerySchema = z.object({
  organizationId: z.string(),
});

export type InviteMentorInput = z.infer<typeof inviteMentorSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type MentorAssignmentInput = z.infer<typeof mentorAssignmentSchema>;
export type OpportunityMentorsQuery = z.infer<typeof opportunityMentorsQuerySchema>;
export type OrganizationMentorsQuery = z.infer<typeof organizationMentorsQuerySchema>;