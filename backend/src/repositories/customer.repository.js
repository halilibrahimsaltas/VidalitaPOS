import { prisma } from '../config/database.js';

export const customerRepository = {
  findAll: async (filters = {}) => {
    const { search, isActive, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { taxNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              sales: true,
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    // Calculate debt for each customer
    const customersWithDebt = await Promise.all(
      customers.map(async (customer) => {
        const transactions = await prisma.customerTransaction.findMany({
          where: { customerId: customer.id },
        });

        const debt = transactions.reduce((sum, t) => {
          if (t.type === 'SALE') {
            return sum + parseFloat(t.amount);
          } else if (t.type === 'PAYMENT') {
            return sum - parseFloat(t.amount);
          }
          return sum;
        }, 0);

        return {
          ...customer,
          debt,
        };
      })
    );

    return {
      customers: customersWithDebt,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  findById: async (id) => {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sales: true,
            transactions: true,
          },
        },
      },
    });

    if (!customer) return null;

    // Calculate debt
    const transactions = await prisma.customerTransaction.findMany({
      where: { customerId: id },
    });

    const debt = transactions.reduce((sum, t) => {
      if (t.type === 'SALE') {
        return sum + parseFloat(t.amount);
      } else if (t.type === 'PAYMENT') {
        return sum - parseFloat(t.amount);
      }
      return sum;
    }, 0);

    return {
      ...customer,
      debt,
    };
  },

  create: async (data) => {
    return prisma.customer.create({
      data,
    });
  },

  update: async (id, data) => {
    return prisma.customer.update({
      where: { id },
      data,
    });
  },

  delete: async (id) => {
    return prisma.customer.delete({
      where: { id },
    });
  },
};

