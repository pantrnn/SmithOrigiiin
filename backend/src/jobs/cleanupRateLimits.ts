
import { cleanupExpiredRateLimits } from '../middleware/ratelimiter';

// Jalankan cleanup setiap 1 jam
export function startRateLimitCleanupJob() {
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 jam

  console.log('Rate limit cleanup job started (runs every 1 hour)');

  setInterval(async () => {
    console.log('[Cleanup] Running rate limit cleanup...');
    await cleanupExpiredRateLimits();
  }, CLEANUP_INTERVAL);

  // Jalankan sekali saat startup
  cleanupExpiredRateLimits();
}