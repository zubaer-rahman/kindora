import { z } from 'zod';

export const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().optional(),
  attachments: z.array(z.object({
    path: z.string(),
    filename: z.string(),
    fileType: z.string(),
    size: z.number(),
  })).optional(),
}).refine(data => data.content || (data.attachments && data.attachments.length > 0), {
  message: "Message must contain either text or an attachment",
  path: ["content"]
});

export const sendGroupMessageSchema = z.object({
  groupId: z.string(),
  content: z.string().optional(),
  attachments: z.array(z.object({
    path: z.string(),
    filename: z.string(),
    fileType: z.string(),
    size: z.number(),
  })).optional(),
}).refine(data => data.content || (data.attachments && data.attachments.length > 0), {
  message: "Message must contain either text or an attachment",
  path: ["content"]
});

export const getMessagesSchema = z.object({
  userId: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;