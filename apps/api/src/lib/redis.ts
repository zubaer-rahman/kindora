import { Redis } from '@upstash/redis';
import env from '../config/env.js';

if (!env.upstash_redis_rest_url) {
  throw new Error('UPSTASH_REDIS_REST_URL is not defined');
}

if (!env.upstash_redis_rest_token) {
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined');
}

export const redis = new Redis({
  url: env.upstash_redis_rest_url,
  token: env.upstash_redis_rest_token,
});