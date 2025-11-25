import { prisma } from '../config/database.js';

export const inventoryRepository = {
  findAll: async (filters = {}) => {
    const { branchId, productId, lowStock, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (productId) {
      where.productId = productId;
    }

    // Note: Low stock filtering is handled in service layer
    // because Prisma doesn't support comparing two columns directly in where clause

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
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
              price: true,
            },
          },
        },
        orderBy: [
          { branch: { name: 'asc' } },
          { product: { name: 'asc' } },
        ],
      }),
      prisma.inventory.count({ where }),
    ]);

    return {
      inventory,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  findByBranchAndProduct: async (branchId, productId) => {
    return prisma.inventory.findUnique({
      where: {
        branchId_productId: {
          branchId,
          productId,
        },
      },
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
            price: true,
          },
        },
      },
    });
  },

  findByBranch: async (branchId) => {
    return prisma.inventory.findMany({
      where: { branchId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            barcode: true,
            sku: true,
            price: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });
  },

  findByProduct: async (productId) => {
    return prisma.inventory.findMany({
      where: { productId },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        branch: {
          name: 'asc',
        },
      },
    });
  },

  create: async (data) => {
    return prisma.inventory.create({
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
            price: true,
          },
        },
      },
    });
  },

  update: async (branchId, productId, data) => {
    return prisma.inventory.update({
      where: {
        branchId_productId: {
          branchId,
          productId,
        },
      },
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
            price: true,
          },
        },
      },
    });
  },

  updateQuantity: async (branchId, productId, quantityChange) => {
    return prisma.inventory.update({
      where: {
        branchId_productId: {
          branchId,
          productId,
        },
      },
      data: {
        quantity: {
          increment: quantityChange,
        },
      },
    });
  },

  getLowStockItems: async (branchId = null) => {
    const where = {};

    if (branchId) {
      where.branchId = branchId;
    }

    const allItems = await prisma.inventory.findMany({
      where,
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
            price: true,
          },
        },
      },
      orderBy: [
        { branch: { name: 'asc' } },
        { product: { name: 'asc' } },
      ],
    });

    // Filter items where quantity <= minStockLevel
    return allItems.filter((item) => item.quantity <= item.minStockLevel);
  },
};

