import { prisma } from '../config/database.js';

export const customerTransactionRepository = {
  findByCustomer: async (customerId, filters = {}) => {
    try {
      const { page = 1, limit = 50 } = filters;
      const skip = (page - 1) * limit;

      // Verify customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

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
    } catch (error) {
      console.error('Error in findByCustomer:', error);
      throw error;
    }
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
    try {
      const transactions = await prisma.customerTransaction.findMany({
        where: { customerId },
      });

      const debt = transactions.reduce((sum, t) => {
        try {
          if (t.type === 'SALE') {
            return sum + parseFloat(t.amount || 0);
          } else if (t.type === 'PAYMENT') {
            return sum - parseFloat(t.amount || 0);
          }
          return sum;
        } catch (error) {
          console.error('Error calculating debt for transaction:', t.id, error);
          return sum;
        }
      }, 0);

      return debt;
    } catch (error) {
      console.error('Error in getCustomerDebt:', error);
      throw error;
    }
  },
};

