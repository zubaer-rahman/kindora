import { z } from 'zod';

export const getUserNotificationsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  unreadOnly: z
    .preprocess(val => val === 'true' || val === true, z.boolean().default(false)),
});

export const markAsReadParamsSchema = z.object({
  notificationId: z.string(),
});

export type GetUserNotificationsQuery = z.infer<typeof getUserNotificationsSchema>;
export type MarkAsReadParams = z.infer<typeof markAsReadParamsSchema>;