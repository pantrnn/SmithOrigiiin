"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const prisma_1 = require("../lib/prisma");
const helper_1 = require("../lib/helper");
class CategoryService {
    static async getAll() {
        return prisma_1.prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { id: 'desc' },
        });
    }
    static async getById(id) {
        const category = await prisma_1.prisma.category.findUnique({
            where: { id },
            include: {
                products: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        discount: true,
                        imageUrl: true,
                    },
                },
            },
        });
        if (!category) {
            throw new Error('Kategori tidak ditemukan');
        }
        return category;
    }
    static async create(name, imageUrl) {
        const existingCategory = await prisma_1.prisma.category.findFirst({
            where: { name },
        });
        if (existingCategory) {
            throw new Error('Kategori dengan nama ini sudah ada');
        }
        return prisma_1.prisma.category.create({
            data: {
                name,
                imageUrl,
            },
        });
    }
    static async update(id, name, imageUrl) {
        const category = await prisma_1.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new Error('Kategori tidak ditemukan');
        }
        const existingCategory = await prisma_1.prisma.category.findFirst({
            where: {
                name,
                NOT: { id },
            },
        });
        if (existingCategory) {
            throw new Error('Kategori dengan nama ini sudah ada');
        }
        if (category.imageUrl && imageUrl && category.imageUrl !== imageUrl) {
            helper_1.FileHelper.deleteFile(category.imageUrl);
        }
        return prisma_1.prisma.category.update({
            where: { id },
            data: {
                name,
                imageUrl,
            },
        });
    }
    static async delete(id) {
        const category = await prisma_1.prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });
        if (!category) {
            throw new Error('Kategori tidak ditemukan');
        }
        if (category._count.products > 0) {
            throw new Error(`Tidak bisa hapus kategori. Masih ada ${category._count.products} produk di kategori ini`);
        }
        if (category.imageUrl) {
            helper_1.FileHelper.deleteFile(category.imageUrl);
        }
        await prisma_1.prisma.category.delete({
            where: { id },
        });
    }
}
exports.CategoryService = CategoryService;
