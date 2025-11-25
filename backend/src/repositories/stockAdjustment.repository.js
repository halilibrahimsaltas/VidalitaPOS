import { prisma } from '../config/database.js';

export const stockAdjustmentRepository = {
  findAll: async (filters = {}) => {
    const { branchId, productId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (productId) {
      where.productId = productId;
    }

    const [adjustments, total] = await Promise.all([
      prisma.stockAdjustment.findMany({
        where,
        skip,
        take: limit,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              barcode: true,
              sku: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockAdjustment.count({ where }),
    ]);

    return {
      adjustments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  findById: async (id) => {
    return prisma.stockAdjustment.findUnique({
      where: { id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            barcode: true,
            sku: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  },

  create: async (data) => {
    return prisma.stockAdjustment.create({
      data,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            barcode: true,
            sku: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  },
};

