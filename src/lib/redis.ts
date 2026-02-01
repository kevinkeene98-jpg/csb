import { Redis } from '@upstash/redis';

// Initialize Redis client
// In production, these are set via Vercel's Upstash integration
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});
