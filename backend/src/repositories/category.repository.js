import { prisma } from '../config/database.js';

export const categoryRepository = {
  findAll: async (filters = {}) => {
    const { includeInactive = false } = filters;
    const where = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    return prisma.category.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          where: includeInactive ? {} : { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  findById: async (id) => {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  findBySlug: async (slug) => {
    return prisma.category.findUnique({
      where: { slug },
    });
  },

  findRootCategories: async () => {
    return prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  create: async (data) => {
    return prisma.category.create({
      data,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  update: async (id, data) => {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  delete: async (id) => {
    return prisma.category.delete({
      where: { id },
    });
  },
};

