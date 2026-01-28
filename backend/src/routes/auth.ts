import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { authMiddleware } from '../middleware/auth';
import { verifyTurnstile } from '../middleware/turnstile';
import { rateLimiter } from '../middleware/rateLimiter'; // Import rate limiter
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

const router = Router();

// Rate limiting untuk register: 2x per 24 jam per IP
const registerRateLimit = rateLimiter({
  action: 'register',
  maxAttempts: 2,
  windowMs: 24 * 60 * 60 * 1000, // 24 jam
  message: 'Anda telah mencapai batas registrasi Silakan coba lagi besok.',
});

// Rate limiting untuk login: 10x per jam per IP (opsional)
const loginRateLimit = rateLimiter({
  action: 'login',
  maxAttempts: 10,
  windowMs: 60 * 60 * 1000, // 1 jam
  message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa menit.',
});

// Register dengan Rate Limiting + Turnstile
router.post('/register', registerRateLimit, verifyTurnstile, async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, dan password harus diisi' });
    }

    const tokens = await AuthService.register(username, email, password);
    res.status(201).json({
      message: 'Registrasi berhasil',
      data: tokens,
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Register admin tanpa rate limiting (internal use)
router.post('/register-admin', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi' });
    }

    const tokens = await AuthService.registerAdmin(username, password);
    res.status(201).json({
      message: 'Admin berhasil dibuat',
      data: tokens,
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Login dengan Rate Limiting + Turnstile
router.post('/login', loginRateLimit, verifyTurnstile, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi' });
    }

    const { accessToken, refreshToken, user } = await AuthService.login(username, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: 'Login berhasil',
      data: {
        accessToken,
        user,
      },
    });
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token tidak ditemukan' });
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      message: 'Token diperbarui',
      data: tokens,
    });
  } catch (error) {
    res.status(401).json({ message: 'Refresh token tidak valid' });
  }
});

router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terautentikasi' });
    }

    await AuthService.logout(req.user.id);
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout berhasil' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/change-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terautentikasi' });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Password lama dan baru harus diisi' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    await AuthService.changePassword(req.user.id, oldPassword, newPassword);
    res.status(200).json({ message: 'Password berhasil diubah. Silakan login kembali' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.post('/create-admin', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminEmail = `${username}@admin.local`;

    const admin = await prisma.user.create({
      data: {
        username,
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
      },
    });

    res.status(201).json({
      message: 'Admin berhasil dibuat',
      data: {
        id: admin.id,
        username: admin.username,
        isAdmin: admin.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;