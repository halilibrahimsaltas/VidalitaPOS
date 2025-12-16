import { prisma } from '../config/database.js';

export const cashRegisterTransactionRepository = {
  findAll: async (filters = {}) => {
    const {
      branchId,
      startDate,
      endDate,
      type,
      page = 1,
      limit = 50,
    } = filters;

    const where = {};
    if (branchId) where.branchId = branchId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.cashRegisterTransaction.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
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
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.cashRegisterTransaction.count({ where }),
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
    return prisma.cashRegisterTransaction.findUnique({
      where: { id },
      include: {
        branch: true,
        sale: true,
        createdBy: true,
      },
    });
  },

  create: async (data) => {
    return prisma.cashRegisterTransaction.create({
      data,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
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

  getBranchBalance: async (branchId, date = null) => {
    const where = { branchId };
    if (date) {
      where.createdAt = {
        lte: new Date(date),
      };
    }

    const transactions = await prisma.cashRegisterTransaction.findMany({
      where,
    });

    return transactions.reduce((balance, transaction) => {
      if (
        transaction.type === 'SALE_IN' ||
        transaction.type === 'MANUAL_IN'
      ) {
        return balance + parseFloat(transaction.amount);
      } else if (
        transaction.type === 'REFUND_OUT' ||
        transaction.type === 'CANCEL_OUT' ||
        transaction.type === 'MANUAL_OUT'
      ) {
        return balance - parseFloat(transaction.amount);
      }
      return balance;
    }, 0);
  },
};

