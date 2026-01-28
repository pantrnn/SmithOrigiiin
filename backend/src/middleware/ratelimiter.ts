import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

interface RateLimitOptions {
  action: string;
  maxAttempts: number;
  windowMs: number; // dalam milidetik
  message?: string;
}

export const rateLimiter = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Dapatkan IP address
      const ip = getClientIp(req);

      if (!ip) {
        console.error('Cannot determine client IP');
        return next(); // Lanjutkan jika IP tidak bisa didapat (fallback)
      }

      // Bersihkan rate limit yang sudah expired (occasional cleanup)
      if (Math.random() < 0.1) { // 10% chance untuk cleanup
        cleanupExpiredRateLimits().catch(err => 
          console.error('Cleanup error:', err)
        );
      }

      // Cek rate limit
      const now = new Date();
      const expiresAt = new Date(now.getTime() + options.windowMs);

      const rateLimit = await prisma.rateLimit.findUnique({
        where: {
          ip_action: {
            ip,
            action: options.action,
          },
        },
      });

      if (rateLimit) {
        // Cek apakah sudah expired
        if (new Date(rateLimit.expiresAt) <= now) {
          // Reset counter jika sudah expired
          await prisma.rateLimit.update({
            where: { id: rateLimit.id },
            data: {
              attempts: 1,
              expiresAt,
              createdAt: now,
            },
          });
          return next();
        }

        // Cek apakah sudah melebihi limit
        if (rateLimit.attempts >= options.maxAttempts) {
          const timeLeft = Math.ceil(
            (new Date(rateLimit.expiresAt).getTime() - now.getTime()) / 1000 / 60
          );
          
          return res.status(429).json({
            message: options.message || `Terlalu banyak percobaan. Silakan coba lagi dalam ${timeLeft} menit.`,
            retryAfter: timeLeft,
            maxAttempts: options.maxAttempts,
          });
        }

        // Increment attempts
        await prisma.rateLimit.update({
          where: { id: rateLimit.id },
          data: {
            attempts: rateLimit.attempts + 1,
          },
        });
      } else {
        // Buat record baru
        await prisma.rateLimit.create({
          data: {
            ip,
            action: options.action,
            attempts: 1,
            expiresAt,
          },
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Jika terjadi error, lanjutkan request (fail-open strategy)
      next();
    }
  };
};

// Helper function untuk mendapatkan IP client
function getClientIp(req: Request): string | null {
  // Cek berbagai header untuk mendapatkan real IP (support proxy & load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  
  if (forwarded) {
    // x-forwarded-for bisa contain multiple IPs, ambil yang pertama
    const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    return ips[0].trim();
  }

  return (
    (req.headers['x-real-ip'] as string) ||
    (req.headers['cf-connecting-ip'] as string) || // Cloudflare
    req.socket.remoteAddress ||
    req.ip ||
    null
  );
}

// Cleanup function untuk menghapus expired rate limits
async function cleanupExpiredRateLimits() {
  try {
    const now = new Date();
    const result = await prisma.rateLimit.deleteMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    });
    console.log(`Cleaned up ${result.count} expired rate limit records`);
  } catch (error) {
    console.error('Cleanup expired rate limits error:', error);
  }
}

// Export cleanup function
export { cleanupExpiredRateLimits };