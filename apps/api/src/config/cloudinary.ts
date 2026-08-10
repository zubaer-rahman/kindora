import cloudinary from 'cloudinary';
import env from './env.js';

cloudinary.v2.config({
  cloud_name: env.cloudinary_cloud_name,
  api_key: env.cloudinary_api_key,
  api_secret: env.cloudinary_api_secret,
});

export default cloudinary.v2;
