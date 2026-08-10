/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppError } from '../lib/errors.js';
import { UploadFileInput } from '../validators/upload.validator.js';

type UploadPayload = {
  link: string;
  mimeType: string;
};

export async function uploadFile(input: UploadFileInput) {
  const { base64File, fileType } = input;

  if (!base64File.startsWith('data:image/')) {
    throw new AppError(400, 'Invalid image format. Must be a data URL.');
  }

  return {
    success: true,
    message: 'Image processed for database storage',
    data: {
      link: base64File,
      mimeType: fileType,
    } as UploadPayload,
  };
}