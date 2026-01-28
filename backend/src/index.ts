import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth';
import forumRouter from './routes/forum';
import uploadRoutes from './routes/upload';
import bannerRouter from './routes/banner';
import productRoutes from './routes/product';
import variantRouter from './routes/variant';
import favoriteRouter from './routes/favorite';
import categoryRoutes from './routes/category';

import { startRateLimitCleanupJob } from './jobs/cleanupRateLimits';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api', variantRouter);
app.use('/api/banners', bannerRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/forums', forumRouter);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static('public/uploads'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// 🔥 START RATE LIMIT CLEANUP JOB
startRateLimitCleanupJob();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

export default app;
