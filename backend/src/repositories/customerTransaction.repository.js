import { prisma } from '../config/database.js';

export const customerTransactionRepository = {
  findByCustomer: async (customerId, filters = {}) => {
    const { page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.customerTransaction.findMany({
        where: { customerId },
        skip,
        take: limit,
        include: {
          sale: {
            select: {
              id: true,
              saleNumber: true,
              total: true,
              createdAt: true,
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
      prisma.customerTransaction.count({ where: { customerId } }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  findById: async (id) => {
    return prisma.customerTransaction.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        sale: {
          select: {
            id: true,
            saleNumber: true,
            total: true,
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
    return prisma.customerTransaction.create({
      data,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        sale: {
          select: {
            id: true,
            saleNumber: true,
            total: true,
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

  getCustomerDebt: async (customerId) => {
    const transactions = await prisma.customerTransaction.findMany({
      where: { customerId },
    });

    return transactions.reduce((sum, t) => {
      if (t.type === 'SALE') {
        return sum + parseFloat(t.amount);
      } else if (t.type === 'PAYMENT') {
        return sum - parseFloat(t.amount);
      }
      return sum;
    }, 0);
  },
};

