import { protectedProcedure } from '@/server/middlewares/with-auth';
import { router } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { uploadFileValidation } from './upload.validation';
import { errorHandler } from '@/server/middlewares/error-handler';

type UploadPayload = {
  link: string;
  mimeType: string;
};

export const uploadRouter = router({
  uploadFile: protectedProcedure
    .input(uploadFileValidation.uploadFileSchema)
    .mutation(async ({ input }) => {
      try {
        const { base64File, fileName, fileType } = input;

        console.log(`Processing image for MongoDB storage: ${fileName} (${fileType})`);

        // We simply return the base64 string (Data URL).
        // Since the forms (OrganizationProfile, Opportunity) save this value 
        // to fields like 'profile_img' or 'banner_img', it will be stored 
        // directly in the MongoDB document.

        // Minor validation: Ensure it's a valid data URL
        if (!base64File.startsWith('data:image/')) {
          throw new Error('Invalid image format. Must be a data URL.');
        }

        return {
          success: true,
          message: 'Image processed for database storage',
          data: {
            link: base64File,
            mimeType: fileType,
          } as UploadPayload,
        };
      } catch (error: any) {
        console.error('Upload Error:', error);
        const { message } = errorHandler(error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: message || 'Failed to process image',
        });
      }
    }),
});
