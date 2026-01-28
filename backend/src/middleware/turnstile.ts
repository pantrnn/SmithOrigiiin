import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export const verifyTurnstile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { turnstileToken } = req.body;

    // Validasi token ada
    if (!turnstileToken) {
      return res.status(400).json({
        message: 'Turnstile token tidak ditemukan'
      });
    }

    // Secret key dari environment variable
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY tidak ditemukan di environment variables');
      return res.status(500).json({
        message: 'Server configuration error'
      });
    }

    // Verifikasi token ke Cloudflare
    const verificationResponse = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        secret: secretKey,
        response: turnstileToken,
        remoteip: req.ip, // Optional: IP address pengguna
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { success, 'error-codes': errorCodes } = verificationResponse.data;

    if (!success) {
      console.error('Turnstile verification failed:', errorCodes);
      return res.status(403).json({
        message: 'Verifikasi keamanan gagal. Silakan coba lagi.',
        errors: errorCodes
      });
    }

    // Verifikasi berhasil, lanjutkan ke controller
    next();
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(500).json({
      message: 'Gagal memverifikasi keamanan'
    });
  }
};