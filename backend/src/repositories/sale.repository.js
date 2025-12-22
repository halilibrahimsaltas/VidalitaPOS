import { prisma } from '../config/database.js';

export const saleRepository = {
  findAll: async (filters = {}) => {
    const { branchId, customerId, cashierId, status, startDate, endDate, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (cashierId) {
      where.cashierId = cashierId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        // Set to start of day (00:00:00.000)
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.createdAt.gte = start;
      }
      if (endDate) {
        // Set to end of day (23:59:59.999) to include the entire day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
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
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          cashier: {
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
      prisma.sale.count({ where }),
    ]);

    return {
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  findById: async (id) => {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
          },
        },
        cashier: {
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
                price: true,
              },
            },
          },
        },
      },
    });
  },

  findBySaleNumber: async (saleNumber) => {
    return prisma.sale.findUnique({
      where: { saleNumber },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        cashier: {
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
    return prisma.sale.create({
      data: {
        ...data,
        items: {
          create: data.items,
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
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        cashier: {
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
                price: true,
              },
            },
          },
        },
      },
    });
  },

  update: async (id, data) => {
    return prisma.sale.update({
      where: { id },
      data,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        cashier: {
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
    return prisma.sale.update({
      where: { id },
      data: { status },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        cashier: {
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
};

