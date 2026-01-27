import { prisma } from '../lib/prisma'
import { FileHelper } from '../lib/helper'

export class CategoryService {
  static async getAll() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { id: 'desc' },
    })
  }

  static async getById(id: number) {
    const category = await prisma.category.findUnique({
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
    })

    if (!category) {
      throw new Error('Kategori tidak ditemukan')
    }

    return category
  }

  static async create(name: string, imageUrl?: string) {
    const existingCategory = await prisma.category.findFirst({
      where: { name },
    })

    if (existingCategory) {
      throw new Error('Kategori dengan nama ini sudah ada')
    }

    return prisma.category.create({
      data: {
        name,
        imageUrl,
      },
    })
  }

  static async update(id: number, name: string, imageUrl?: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      throw new Error('Kategori tidak ditemukan')
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        NOT: { id },
      },
    })

    if (existingCategory) {
      throw new Error('Kategori dengan nama ini sudah ada')
    }

    if (category.imageUrl && imageUrl && category.imageUrl !== imageUrl) {
      FileHelper.deleteFile(category.imageUrl)
    }

    return prisma.category.update({
      where: { id },
      data: {
        name,
        imageUrl,
      },
    })
  }

  static async delete(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    if (!category) {
      throw new Error('Kategori tidak ditemukan')
    }

    if (category._count.products > 0) {
      throw new Error(
        `Tidak bisa hapus kategori. Masih ada ${category._count.products} produk di kategori ini`
      )
    }

    if (category.imageUrl) {
      FileHelper.deleteFile(category.imageUrl)
    }

    await prisma.category.delete({
      where: { id },
    })
  }
}
