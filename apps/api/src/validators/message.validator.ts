import { z } from 'zod';

export const attachmentSchema = z.object({
  path: z.string(),
  filename: z.string(),
  fileType: z.string(),
  size: z.number(),
});

export const sendMessageSchema = z
  .object({
    receiverId: z.string(),
    content: z.string().optional(),
    attachments: z.array(attachmentSchema).optional(),
  })
  .refine(data => data.content || (data.attachments && data.attachments.length > 0), {
    message: 'Message must contain either text or an attachment',
    path: ['content'],
  });

export const sendGroupMessageSchema = z
  .object({
    groupId: z.string(),
    content: z.string().optional(),
    attachments: z.array(attachmentSchema).optional(),
  })
  .refine(data => data.content || (data.attachments && data.attachments.length > 0), {
    message: 'Message must contain either text or an attachment',
    path: ['content'],
  });

export const getMessagesParamsSchema = z.object({
  userId: z.string(),
});

export const getMessagesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const conversationIdParamsSchema = z.object({
  conversationId: z.string(),
});

export const createGroupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  memberIds: z.array(z.string()),
  isOrganizationGroup: z.boolean().optional(),
  adminIds: z.array(z.string()).optional(),
  opportunityId: z.string().optional(),
});

export const groupIdParamsSchema = z.object({
  groupId: z.string(),
});

export const groupMemberParamsSchema = z.object({
  groupId: z.string(),
  memberId: z.string(),
});

export const setTypingSchema = z.object({
  targetId: z.string(),
  isTyping: z.boolean(),
  isGroup: z.boolean().default(false),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SendGroupMessageInput = z.infer<typeof sendGroupMessageSchema>;
export type GetMessagesParams = z.infer<typeof getMessagesParamsSchema>;
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;
export type ConversationIdParams = z.infer<typeof conversationIdParamsSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type GroupIdParams = z.infer<typeof groupIdParamsSchema>;
export type GroupMemberParams = z.infer<typeof groupMemberParamsSchema>;
export type SetTypingInput = z.infer<typeof setTypingSchema>;