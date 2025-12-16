import { cashRegisterTransactionRepository } from '../repositories/cashRegisterTransaction.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';

const cashRegisterTransactionService = {
  getAllTransactions: async (filters) => {
    return cashRegisterTransactionRepository.findAll(filters);
  },

  getTransactionById: async (id) => {
    const transaction = await cashRegisterTransactionRepository.findById(id);
    if (!transaction) {
      throw new ApiError(404, 'Cash register transaction not found');
    }
    return transaction;
  },

  createTransaction: async (transactionData) => {
    const { branchId, saleId, type, amount, paymentMethod, description, createdById } = transactionData;

    // Verify branch exists
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }

    // Verify sale exists if provided
    if (saleId) {
      const sale = await prisma.sale.findUnique({ where: { id: saleId } });
      if (!sale) {
        throw new ApiError(404, 'Sale not found');
      }
    }

    return cashRegisterTransactionRepository.create({
      branchId,
      saleId: saleId || null,
      type,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || null,
      description: description || null,
      createdById,
    });
  },

  getBranchBalance: async (branchId, date = null) => {
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }

    return cashRegisterTransactionRepository.getBranchBalance(branchId, date);
  },

  // Record sale income
  recordSaleIncome: async (sale, createdById) => {
    // Only record cash and card payments as income
    if (sale.paymentMethod === 'CASH' || sale.paymentMethod === 'CARD') {
      return cashRegisterTransactionRepository.create({
        branchId: sale.branchId,
        saleId: sale.id,
        type: 'SALE_IN',
        amount: sale.paidAmount,
        paymentMethod: sale.paymentMethod,
        description: `Satış - ${sale.saleNumber}`,
        createdById,
      });
    } else if (sale.paymentMethod === 'MIXED') {
      // For mixed payments, record cash and card portions separately
      // This is simplified - in real scenario, you'd track cash vs card amounts
      const cashAmount = sale.paidAmount; // This should be calculated from actual payment split
      if (cashAmount > 0) {
        return cashRegisterTransactionRepository.create({
          branchId: sale.branchId,
          saleId: sale.id,
          type: 'SALE_IN',
          amount: cashAmount,
          paymentMethod: 'CASH',
          description: `Satış (Nakit) - ${sale.saleNumber}`,
          createdById,
        });
      }
    }
    return null;
  },

  // Record refund/cancel outflow
  recordRefundOutflow: async (sale, refundAmount, createdById) => {
    // Only record cash and card refunds as outflow
    if (sale.paymentMethod === 'CASH' || sale.paymentMethod === 'CARD') {
      return cashRegisterTransactionRepository.create({
        branchId: sale.branchId,
        saleId: sale.id,
        type: 'REFUND_OUT',
        amount: refundAmount,
        paymentMethod: sale.paymentMethod,
        description: `İade - ${sale.saleNumber}`,
        createdById,
      });
    } else if (sale.paymentMethod === 'MIXED') {
      // For mixed payments, calculate cash portion
      const cashRefundAmount = refundAmount; // Simplified
      if (cashRefundAmount > 0) {
        return cashRegisterTransactionRepository.create({
          branchId: sale.branchId,
          saleId: sale.id,
          type: 'REFUND_OUT',
          amount: cashRefundAmount,
          paymentMethod: 'CASH',
          description: `İade (Nakit) - ${sale.saleNumber}`,
          createdById,
        });
      }
    }
    return null;
  },

  recordCancelOutflow: async (sale, createdById) => {
    // Only record cash and card cancellations as outflow
    if (sale.paymentMethod === 'CASH' || sale.paymentMethod === 'CARD') {
      return cashRegisterTransactionRepository.create({
        branchId: sale.branchId,
        saleId: sale.id,
        type: 'CANCEL_OUT',
        amount: sale.paidAmount,
        paymentMethod: sale.paymentMethod,
        description: `İptal - ${sale.saleNumber}`,
        createdById,
      });
    } else if (sale.paymentMethod === 'MIXED') {
      const cashAmount = sale.paidAmount; // Simplified
      if (cashAmount > 0) {
        return cashRegisterTransactionRepository.create({
          branchId: sale.branchId,
          saleId: sale.id,
          type: 'CANCEL_OUT',
          amount: cashAmount,
          paymentMethod: 'CASH',
          description: `İptal (Nakit) - ${sale.saleNumber}`,
          createdById,
        });
      }
    }
    return null;
  },
};

export default cashRegisterTransactionService;

