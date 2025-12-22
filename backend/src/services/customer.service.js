import { customerRepository } from '../repositories/customer.repository.js';
import { ApiError } from '../utils/ApiError.js';

export const customerService = {
  getAllCustomers: async (filters) => {
    return customerRepository.findAll(filters);
  },

  getCustomerById: async (id) => {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }
    return customer;
  },

  createCustomer: async (customerData) => {
    return customerRepository.create(customerData);
  },

  updateCustomer: async (id, customerData) => {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    return customerRepository.update(id, customerData);
  },

  deleteCustomer: async (id) => {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    // Check if customer has sales
    if (customer._count?.sales > 0) {
      throw new ApiError(400, 'Cannot delete customer with associated sales');
    }

    return customerRepository.delete(id);
  },

  getCustomerStatistics: async (id, filters = {}) => {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    const { startDate, endDate } = filters;
    const { prisma } = await import('../config/database.js');

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        // Set to start of day (00:00:00.000)
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.createdAt.gte = start;
      }
      if (endDate) {
        // Set to end of day (23:59:59.999) to include the entire day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = end;
      }
    }

    // Get all sales for this customer
    const sales = await prisma.sale.findMany({
      where: {
        customerId: id,
        status: 'COMPLETED',
        ...dateFilter,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + parseFloat(sale.discount || 0), 0);
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Monthly breakdown
    const monthlyBreakdown = sales.reduce((acc, sale) => {
      const date = new Date(sale.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          monthName,
          sales: 0,
          revenue: 0,
          items: 0,
        };
      }
      acc[monthKey].sales += 1;
      acc[monthKey].revenue += parseFloat(sale.total);
      acc[monthKey].items += sale.items.reduce((sum, item) => sum + item.quantity, 0);
      return acc;
    }, {});

    // Product breakdown (top products)
    const productBreakdown = sales.reduce((acc, sale) => {
      sale.items.forEach((item) => {
        const productId = item.product.id;
        const productName = item.product.name;
        if (!acc[productId]) {
          acc[productId] = {
            productId,
            productName,
            quantity: 0,
            revenue: 0,
            sales: 0,
          };
        }
        acc[productId].quantity += item.quantity;
        acc[productId].revenue += parseFloat(item.total);
        acc[productId].sales += 1;
      });
      return acc;
    }, {});

    // Branch breakdown
    const branchBreakdown = sales.reduce((acc, sale) => {
      const branchId = sale.branch.id;
      const branchName = sale.branch.name;
      if (!acc[branchId]) {
        acc[branchId] = {
          branchId,
          branchName,
          sales: 0,
          revenue: 0,
        };
      }
      acc[branchId].sales += 1;
      acc[branchId].revenue += parseFloat(sale.total);
      return acc;
    }, {});

    // Get debt
    const transactions = await prisma.customerTransaction.findMany({
      where: {
        customerId: id,
        ...dateFilter,
      },
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
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
      summary: {
        totalSales,
        totalRevenue,
        totalDiscount,
        totalItems,
        averageSale,
        currentDebt: debt,
      },
      monthlyBreakdown: Object.values(monthlyBreakdown).sort((a, b) => b.month.localeCompare(a.month)),
      topProducts: Object.values(productBreakdown)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
      branchBreakdown: Object.values(branchBreakdown),
      recentSales: sales.slice(0, 10).map((sale) => ({
        id: sale.id,
        saleNumber: sale.saleNumber,
        date: sale.createdAt,
        total: parseFloat(sale.total),
        branch: sale.branch.name,
        items: sale.items.length,
      })),
    };
  },
};

export default customerService;

