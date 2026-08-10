import { z } from 'zod';

export const uploadFileSchema = z.object({
  base64File: z.string(),
  folder: z.string().optional(),
  fileName: z.string(),
  fileType: z.string(),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;