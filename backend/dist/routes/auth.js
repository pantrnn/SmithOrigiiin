"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const auth_1 = require("../middleware/auth");
const turnstile_1 = require("../middleware/turnstile");
const ratelimiter_1 = require("../middleware/ratelimiter"); // Import rate limiter
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
// Rate limiting HANYA untuk register: 2x per 24 jam per IP
const registerRateLimit = (0, ratelimiter_1.rateLimiter)({
    action: 'register',
    maxAttempts: 2,
    windowMs: 24 * 60 * 60 * 1000, // 24 jam
    message: 'Anda telah mencapai batas registrasi. Silakan coba lagi besok.',
});
// Register dengan Rate Limiting + Turnstile
router.post('/register', registerRateLimit, turnstile_1.verifyTurnstile, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, dan password harus diisi' });
        }
        const tokens = await authService_1.AuthService.register(username, email, password);
        res.status(201).json({
            message: 'Registrasi berhasil',
            data: tokens,
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Register admin tanpa rate limiting (internal use)
router.post('/register-admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password harus diisi' });
        }
        const tokens = await authService_1.AuthService.registerAdmin(username, password);
        res.status(201).json({
            message: 'Admin berhasil dibuat',
            data: tokens,
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Login dengan Turnstile (TANPA Rate Limiting)
router.post('/login', turnstile_1.verifyTurnstile, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password harus diisi' });
        }
        const { accessToken, refreshToken, user } = await authService_1.AuthService.login(username, password);
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
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token tidak ditemukan' });
        }
        const tokens = await authService_1.AuthService.refreshToken(refreshToken);
        res.status(200).json({
            message: 'Token diperbarui',
            data: tokens,
        });
    }
    catch (error) {
        res.status(401).json({ message: 'Refresh token tidak valid' });
    }
});
router.post('/logout', auth_1.authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Tidak terautentikasi' });
        }
        await authService_1.AuthService.logout(req.user.id);
        res.clearCookie('refreshToken');
        res.json({ message: 'Logout berhasil' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/change-password', auth_1.authMiddleware, async (req, res) => {
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
        await authService_1.AuthService.changePassword(req.user.id, oldPassword, newPassword);
        res.status(200).json({ message: 'Password berhasil diubah. Silakan login kembali' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post('/create-admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password harus diisi' });
        }
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Username sudah digunakan' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const adminEmail = `${username}@admin.local`;
        const admin = await prisma_1.prisma.user.create({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
