"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRateLimitCleanupJob = startRateLimitCleanupJob;
const ratelimiter_1 = require("../middleware/ratelimiter");
// Jalankan cleanup setiap 1 jam
function startRateLimitCleanupJob() {
    const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 jam
    console.log('Rate limit cleanup job started (runs every 1 hour)');
    setInterval(async () => {
        console.log('[Cleanup] Running rate limit cleanup...');
        await (0, ratelimiter_1.cleanupExpiredRateLimits)();
    }, CLEANUP_INTERVAL);
    // Jalankan sekali saat startup
    (0, ratelimiter_1.cleanupExpiredRateLimits)();
}
