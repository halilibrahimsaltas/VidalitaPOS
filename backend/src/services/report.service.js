import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

const reportService = {
  getSalesSummary: async (filters = {}) => {
    const { branchId, startDate, endDate } = filters;

    const where = {
      status: 'COMPLETED',
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const sales = await prisma.sale.findMany({
      where,
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
      },
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + parseFloat(sale.discount), 0);
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Daily breakdown
    const dailyBreakdown = sales.reduce((acc, sale) => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, sales: 0, revenue: 0 };
      }
      acc[date].sales += 1;
      acc[date].revenue += parseFloat(sale.total);
      return acc;
    }, {});

    return {
      summary: {
        totalSales,
        totalRevenue,
        totalDiscount,
        totalItems,
        averageSale,
      },
      dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => a.date.localeCompare(b.date)),
    };
  },

  getInventoryStatus: async (filters = {}) => {
    const { branchId } = filters;

    const where = {};

    if (branchId) {
      where.branchId = branchId;
    }

    const inventory = await prisma.inventory.findMany({
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
            price: true,
          },
        },
      },
    });

    const totalProducts = inventory.length;
    const totalQuantity = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalValue = inventory.reduce((sum, inv) => sum + (inv.quantity * parseFloat(inv.product.price)), 0);
    const lowStockItems = inventory.filter((inv) => inv.quantity <= inv.minStockLevel);

    // By branch
    const byBranch = inventory.reduce((acc, inv) => {
      const branchName = inv.branch.name;
      if (!acc[branchName]) {
        acc[branchName] = {
          branch: inv.branch,
          totalProducts: 0,
          totalQuantity: 0,
          totalValue: 0,
          lowStockCount: 0,
        };
      }
      acc[branchName].totalProducts += 1;
      acc[branchName].totalQuantity += inv.quantity;
      acc[branchName].totalValue += inv.quantity * parseFloat(inv.product.price);
      if (inv.quantity <= inv.minStockLevel) {
        acc[branchName].lowStockCount += 1;
      }
      return acc;
    }, {});

    return {
      summary: {
        totalProducts,
        totalQuantity,
        totalValue,
        lowStockCount: lowStockItems.length,
      },
      byBranch: Object.values(byBranch),
      lowStockItems: lowStockItems.slice(0, 10), // Top 10
    };
  },

  getTopProducts: async (filters = {}) => {
    const { branchId, startDate, endDate, limit = 10 } = filters;

    const where = {
      status: 'COMPLETED',
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
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

    // Aggregate by product
    const productStats = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.productId;
        if (!productStats[productId]) {
          productStats[productId] = {
            product: item.product,
            quantity: 0,
            revenue: 0,
            sales: 0,
          };
        }
        productStats[productId].quantity += item.quantity;
        productStats[productId].revenue += parseFloat(item.total);
        productStats[productId].sales += 1;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, parseInt(limit));

    return topProducts;
  },

  getDebtSummary: async (filters = {}) => {
    const { branchId } = filters;

    const where = {};

    if (branchId) {
      // Get customers with sales from this branch
      const sales = await prisma.sale.findMany({
        where: { branchId },
        select: { customerId: true },
      });
      const customerIds = [...new Set(sales.map((s) => s.customerId).filter(Boolean))];
      if (customerIds.length > 0) {
        where.customerId = { in: customerIds };
      } else {
        return {
          summary: {
            totalCustomers: 0,
            totalDebt: 0,
            averageDebt: 0,
          },
          topDebtors: [],
        };
      }
    }

    const customers = await prisma.customer.findMany({
      where: {
        ...where,
        isActive: true,
      },
      include: {
        transactions: true,
      },
    });

    const customersWithDebt = customers.map((customer) => {
      const debt = customer.transactions.reduce((sum, t) => {
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
    }).filter((c) => c.debt > 0);

    const totalCustomers = customersWithDebt.length;
    const totalDebt = customersWithDebt.reduce((sum, c) => sum + c.debt, 0);
    const averageDebt = totalCustomers > 0 ? totalDebt / totalCustomers : 0;

    const topDebtors = customersWithDebt
      .sort((a, b) => b.debt - a.debt)
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        debt: c.debt,
      }));

    return {
      summary: {
        totalCustomers,
        totalDebt,
        averageDebt,
      },
      topDebtors,
    };
  },

  getCashRegisterReport: async (filters = {}) => {
    const { branchId, startDate, endDate, period = 'daily' } = filters;

    // Calculate date range based on period
    let dateStart, dateEnd;
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    if (period === 'daily') {
      dateStart = startDate ? new Date(startDate) : new Date(now);
      dateStart.setHours(0, 0, 0, 0);
      dateEnd = endDate ? new Date(endDate) : new Date(now);
      dateEnd.setHours(23, 59, 59, 999);
    } else if (period === 'weekly') {
      dateStart = startDate ? new Date(startDate) : new Date(now);
      dateStart.setDate(dateStart.getDate() - 7);
      dateStart.setHours(0, 0, 0, 0);
      dateEnd = endDate ? new Date(endDate) : new Date(now);
      dateEnd.setHours(23, 59, 59, 999);
    } else if (period === 'monthly') {
      dateStart = startDate ? new Date(startDate) : new Date(now);
      dateStart.setDate(1);
      dateStart.setHours(0, 0, 0, 0);
      dateEnd = endDate ? new Date(endDate) : new Date(now);
      dateEnd.setMonth(dateEnd.getMonth() + 1);
      dateEnd.setDate(0);
      dateEnd.setHours(23, 59, 59, 999);
    } else {
      dateStart = startDate ? new Date(startDate) : new Date(now);
      dateStart.setHours(0, 0, 0, 0);
      dateEnd = endDate ? new Date(endDate) : new Date(now);
      dateEnd.setHours(23, 59, 59, 999);
    }

    const where = {
      createdAt: {
        gte: dateStart,
        lte: dateEnd,
      },
    };

    if (branchId) {
      where.branchId = branchId;
    }

    // Get all sales (completed and refunded)
    const sales = await prisma.sale.findMany({
      where: {
        ...where,
        status: { in: ['COMPLETED', 'REFUNDED', 'PARTIALLY_REFUNDED'] },
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate totals
    const completedSales = sales.filter((s) => s.status === 'COMPLETED');
    const refundedSales = sales.filter((s) => s.status === 'REFUNDED');
    const partiallyRefundedSales = sales.filter((s) => s.status === 'PARTIALLY_REFUNDED');

    // Total sales (completed)
    const totalSales = completedSales.length;
    const totalSalesAmount = completedSales.reduce((sum, s) => sum + parseFloat(s.total), 0);
    const totalDiscount = completedSales.reduce((sum, s) => sum + parseFloat(s.discount || 0), 0);

    // Total refunds
    const totalRefunds = refundedSales.length + partiallyRefundedSales.length;
    const totalRefundAmount = [
      ...refundedSales,
      ...partiallyRefundedSales,
    ].reduce((sum, s) => sum + parseFloat(s.total), 0);

    // Net amount
    const netAmount = totalSalesAmount - totalRefundAmount;

    // Payment method breakdown
    const paymentMethods = {
      CASH: { count: 0, amount: 0 },
      CARD: { count: 0, amount: 0 },
      CREDIT: { count: 0, amount: 0 },
      MIXED: { count: 0, amount: 0 },
    };

    completedSales.forEach((sale) => {
      const method = sale.paymentMethod;
      if (paymentMethods[method]) {
        paymentMethods[method].count += 1;
        paymentMethods[method].amount += parseFloat(sale.total);
      }
    });

    // Daily breakdown
    const dailyBreakdown = sales.reduce((acc, sale) => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          sales: { count: 0, amount: 0 },
          refunds: { count: 0, amount: 0 },
          net: 0,
        };
      }

      if (sale.status === 'COMPLETED') {
        acc[date].sales.count += 1;
        acc[date].sales.amount += parseFloat(sale.total);
      } else if (sale.status === 'REFUNDED' || sale.status === 'PARTIALLY_REFUNDED') {
        acc[date].refunds.count += 1;
        acc[date].refunds.amount += parseFloat(sale.total);
      }

      acc[date].net = acc[date].sales.amount - acc[date].refunds.amount;
      return acc;
    }, {});

    // Sales list for detail
    const salesList = completedSales.map((sale) => ({
      id: sale.id,
      saleNumber: sale.saleNumber,
      date: sale.createdAt,
      total: parseFloat(sale.total),
      paymentMethod: sale.paymentMethod,
      discount: parseFloat(sale.discount || 0),
      cashier: sale.cashier ? sale.cashier.fullName : 'N/A',
    }));

    // Refunds list for detail
    const refundsList = [...refundedSales, ...partiallyRefundedSales].map((sale) => ({
      id: sale.id,
      saleNumber: sale.saleNumber,
      date: sale.createdAt,
      total: parseFloat(sale.total),
      status: sale.status,
      originalSaleNumber: sale.saleNumber, // For tracking original sale
    }));

    // Get branch info if filtered by branch
    const branchInfo = branchId && sales.length > 0 ? sales[0].branch : null;

    return {
      period: {
        startDate: dateStart,
        endDate: dateEnd,
        type: period,
        branch: branchInfo,
      },
      summary: {
        totalSales,
        totalSalesAmount,
        totalRefunds,
        totalRefundAmount,
        totalDiscount,
        netAmount,
      },
      paymentMethods,
      dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => a.date.localeCompare(b.date)),
      salesList: salesList.slice(0, 100), // Limit to 100 for performance
      refundsList: refundsList.slice(0, 100),
    };
  },

  getDashboardOverview: async (filters = {}) => {
    const { branchId } = filters;

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    const whereToday = {
      status: 'COMPLETED',
      createdAt: { gte: today },
    };
    const whereYesterday = {
      status: 'COMPLETED',
      createdAt: { gte: yesterday, lt: today },
    };
    const whereLast7Days = {
      status: 'COMPLETED',
      createdAt: { gte: last7Days },
    };
    const whereLast30Days = {
      status: 'COMPLETED',
      createdAt: { gte: last30Days },
    };

    if (branchId) {
      whereToday.branchId = branchId;
      whereYesterday.branchId = branchId;
      whereLast7Days.branchId = branchId;
      whereLast30Days.branchId = branchId;
    }

    // Sales stats
    const [salesToday, salesYesterday, salesLast7Days, salesLast30Days] = await Promise.all([
      prisma.sale.findMany({ where: whereToday }),
      prisma.sale.findMany({ where: whereYesterday }),
      prisma.sale.findMany({ where: whereLast7Days }),
      prisma.sale.findMany({ where: whereLast30Days }),
    ]);

    const revenueToday = salesToday.reduce((sum, s) => sum + parseFloat(s.total), 0);
    const revenueYesterday = salesYesterday.reduce((sum, s) => sum + parseFloat(s.total), 0);
    const revenueLast7Days = salesLast7Days.reduce((sum, s) => sum + parseFloat(s.total), 0);
    const revenueLast30Days = salesLast30Days.reduce((sum, s) => sum + parseFloat(s.total), 0);

    // Inventory stats
    const inventoryWhere = branchId ? { branchId } : {};
    const inventory = await prisma.inventory.findMany({
      where: inventoryWhere,
    });
    const lowStockCount = inventory.filter((inv) => inv.quantity <= inv.minStockLevel).length;

    // Customer debt stats
    const customers = await prisma.customer.findMany({
      where: { isActive: true },
      include: { transactions: true },
    });
    const customersWithDebt = customers
      .map((c) => ({
        ...c,
        debt: c.transactions.reduce((sum, t) => {
          if (t.type === 'SALE') return sum + parseFloat(t.amount);
          if (t.type === 'PAYMENT') return sum - parseFloat(t.amount);
          return sum;
        }, 0),
      }))
      .filter((c) => c.debt > 0);
    const totalDebt = customersWithDebt.reduce((sum, c) => sum + c.debt, 0);

    return {
      sales: {
        today: {
          count: salesToday.length,
          revenue: revenueToday,
        },
        yesterday: {
          count: salesYesterday.length,
          revenue: revenueYesterday,
        },
        last7Days: {
          count: salesLast7Days.length,
          revenue: revenueLast7Days,
        },
        last30Days: {
          count: salesLast30Days.length,
          revenue: revenueLast30Days,
        },
      },
      inventory: {
        totalProducts: inventory.length,
        lowStockCount,
      },
      customers: {
        totalDebt,
        debtorsCount: customersWithDebt.length,
      },
    };
  },
};

export default reportService;

