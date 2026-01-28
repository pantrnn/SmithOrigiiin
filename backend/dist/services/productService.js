"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const prisma_1 = require("../lib/prisma");
const helper_1 = require("../lib/helper");
class ProductService {
    static async getAll(page = 1, limit = 10, categoryId, search) {
        const skip = (page - 1) * limit;
        const where = {};
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where,
                include: {
                    category: true,
                    variants: true,
                    _count: { select: { favorites: true } },
                },
                skip,
                take: limit,
                orderBy: { id: 'desc' },
            }),
            prisma_1.prisma.product.count({ where }),
        ]);
        return {
            products: products.map((p) => ({
                ...p,
                createdAt: p.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async getById(id) {
        const product = await prisma_1.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                variants: true,
                _count: { select: { favorites: true } },
            },
        });
        if (!product) {
            throw new Error('Produk tidak ditemukan');
        }
        return {
            ...product,
            createdAt: product.createdAt,
        };
    }
    static async create(data) {
        if (data.categoryId) {
            const category = await prisma_1.prisma.category.findUnique({
                where: { id: data.categoryId },
            });
            if (!category)
                throw new Error('Kategori tidak ditemukan');
        }
        const product = await prisma_1.prisma.product.create({
            data,
            include: {
                category: true,
                variants: true,
            },
        });
        return {
            ...product,
            createdAt: product.createdAt,
        };
    }
    static async update(id, data) {
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new Error('Produk tidak ditemukan');
        if (data.categoryId) {
            const category = await prisma_1.prisma.category.findUnique({
                where: { id: data.categoryId },
            });
            if (!category)
                throw new Error('Kategori tidak ditemukan');
        }
        if (product.imageUrl && data.imageUrl && product.imageUrl !== data.imageUrl) {
            helper_1.FileHelper.deleteFile(product.imageUrl);
        }
        const updatedProduct = await prisma_1.prisma.product.update({
            where: { id },
            data,
            include: {
                category: true,
                variants: true,
            },
        });
        return {
            ...updatedProduct,
            createdAt: updatedProduct.createdAt,
        };
    }
    static async delete(id) {
        const product = await prisma_1.prisma.product.findUnique({
            where: { id },
            include: { variants: true },
        });
        if (!product) {
            throw new Error('Produk tidak ditemukan');
        }
        if (product.imageUrl) {
            helper_1.FileHelper.deleteFile(product.imageUrl);
        }
        const variantImages = product.variants
            .map((v) => v.imageUrl)
            .filter((url) => Boolean(url));
        helper_1.FileHelper.deleteFiles(variantImages);
        await prisma_1.prisma.product.delete({ where: { id } });
    }
}
exports.ProductService = ProductService;
