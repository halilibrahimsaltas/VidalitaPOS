import { prisma } from '../config/database.js';

export const stockTransferRepository = {
  findAll: async (filters = {}) => {
    const { branchId, status, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (branchId) {
      where.OR = [
        { fromBranchId: branchId },
        { toBranchId: branchId },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [transfers, total] = await Promise.all([
      prisma.stockTransfer.findMany({
        where,
        skip,
        take: limit,
        include: {
          fromBranch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          toBranch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  barcode: true,
                  sku: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockTransfer.count({ where }),
    ]);

    return {
      transfers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  findById: async (id) => {
    return prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        fromBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        toBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                barcode: true,
                sku: true,
              },
            },
          },
        },
      },
    });
  },

  create: async (data) => {
    return prisma.stockTransfer.create({
      data: {
        ...data,
        items: {
          create: data.items,
        },
      },
      include: {
        fromBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        toBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                barcode: true,
                sku: true,
              },
            },
          },
        },
      },
    });
  },

  update: async (id, data) => {
    return prisma.stockTransfer.update({
      where: { id },
      data,
      include: {
        fromBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        toBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                barcode: true,
                sku: true,
              },
            },
          },
        },
      },
    });
  },

  updateStatus: async (id, status) => {
    return prisma.stockTransfer.update({
      where: { id },
      data: { status },
      include: {
        fromBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        toBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                barcode: true,
                sku: true,
              },
            },
          },
        },
      },
    });
  },
};

