import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8000,
  mongodb_uri: process.env.MONGODB_URI,
  nextauth_secret: process.env.NEXTAUTH_SECRET,
  nextauth_url: process.env.NEXTAUTH_URL,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
  jwt_secret: process.env.JWT_SECRET,
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: Number(process.env.SMTP_PORT) || 2525,
  smtp_user: process.env.SMTP_USER,
  smtp_password: process.env.SMTP_PASSWORD,
  google_app_password: process.env.GOOGLE_APP_PASSWORD,
  gmail_user: process.env.GMAIL_USER,
  enable_message_notifications: process.env.ENABLE_MESSAGE_NOTIFICATIONS === 'true',
  message_notification_cron_schedule: process.env.MESSAGE_NOTIFICATION_CRON_SCHEDULE,
  upstash_redis_rest_url: process.env.UPSTASH_REDIS_REST_URL,
  upstash_redis_rest_token: process.env.UPSTASH_REDIS_REST_TOKEN,
  allowed_origins: process.env.ALLOWED_ORIGINS,
  expo_public_api_url: process.env.EXPO_PUBLIC_API_URL,
};
