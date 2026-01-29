"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    static async register(req, res) {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({
                    message: 'Username, email, dan password harus diisi'
                });
            }
            // Turnstile sudah diverifikasi di middleware
            const result = await authService_1.AuthService.register(username, email, password);
            res.status(201).json({
                message: 'Registrasi berhasil',
                data: result,
            });
        }
        catch (error) {
            console.error('Register error:', error);
            res.status(400).json({
                message: error.message || 'Registrasi gagal'
            });
        }
    }
    static async registerAdmin(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({
                    message: 'Username dan password harus diisi'
                });
            }
            const result = await authService_1.AuthService.registerAdmin(username, password);
            res.status(201).json({
                message: 'Admin berhasil didaftarkan',
                data: result,
            });
        }
        catch (error) {
            console.error('Register admin error:', error);
            res.status(400).json({
                message: error.message || 'Registrasi admin gagal'
            });
        }
    }
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({
                    message: 'Username dan password harus diisi'
                });
            }
            // Turnstile sudah diverifikasi di middleware
            const result = await authService_1.AuthService.login(username, password);
            res.status(200).json({
                message: 'Login berhasil',
                data: result,
            });
        }
        catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.message;
            if (errorMessage.includes('does not exist in the current database')) {
                return res.status(500).json({
                    message: 'Database belum disetup. Silakan jalankan migration terlebih dahulu.'
                });
            }
            res.status(401).json({
                message: errorMessage || 'Login gagal'
            });
        }
    }
    static async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({
                    message: 'Refresh token tidak ditemukan'
                });
            }
            const result = await authService_1.AuthService.refreshToken(refreshToken);
            res.status(200).json({
                message: 'Token berhasil diperbarui',
                data: result,
            });
        }
        catch (error) {
            console.error('Refresh token error:', error);
            res.status(401).json({
                message: 'Refresh token tidak valid'
            });
        }
    }
    static async logout(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    message: 'User tidak terautentikasi'
                });
            }
            await authService_1.AuthService.logout(userId);
            res.status(200).json({
                message: 'Logout berhasil',
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                message: 'Logout gagal'
            });
        }
    }
    static async changePassword(req, res) {
        try {
            const userId = req.user?.id;
            const { oldPassword, newPassword } = req.body;
            if (!userId) {
                return res.status(401).json({
                    message: 'User tidak terautentikasi'
                });
            }
            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    message: 'Password lama dan baru harus diisi'
                });
            }
            await authService_1.AuthService.changePassword(userId, oldPassword, newPassword);
            res.status(200).json({
                message: 'Password berhasil diubah',
            });
        }
        catch (error) {
            console.error('Change password error:', error);
            res.status(400).json({
                message: error.message || 'Gagal mengubah password'
            });
        }
    }
}
exports.AuthController = AuthController;
