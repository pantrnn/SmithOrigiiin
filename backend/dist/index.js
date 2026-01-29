"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const forum_1 = __importDefault(require("./routes/forum"));
const upload_1 = __importDefault(require("./routes/upload"));
const banner_1 = __importDefault(require("./routes/banner"));
const product_1 = __importDefault(require("./routes/product"));
const variant_1 = __importDefault(require("./routes/variant"));
const favorite_1 = __importDefault(require("./routes/favorite"));
const category_1 = __importDefault(require("./routes/category"));
const cleanupRateLimits_1 = require("./jobs/cleanupRateLimits");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_1.default);
app.use('/api/categories', category_1.default);
app.use('/api/products', product_1.default);
app.use('/api', variant_1.default);
app.use('/api/banners', banner_1.default);
app.use('/api/favorites', favorite_1.default);
app.use('/api/forums', forum_1.default);
app.use('/api/upload', upload_1.default);
app.use('/uploads', express_1.default.static('public/uploads'));
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});
// 🔥 START RATE LIMIT CLEANUP JOB
(0, cleanupRateLimits_1.startRateLimitCleanupJob)();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
exports.default = app;
