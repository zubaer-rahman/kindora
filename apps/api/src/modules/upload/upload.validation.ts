import { z } from 'zod'; // Import Zod for validation

const uploadFileSchema = z.object({
  base64File: z.string(),
  folder: z.string().optional(),
  fileName: z.string(),
  fileType: z.string(),
});

export const uploadFileValidation = { uploadFileSchema };
