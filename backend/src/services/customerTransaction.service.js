import { customerTransactionRepository } from '../repositories/customerTransaction.repository.js';
import { customerRepository } from '../repositories/customer.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';

export const customerTransactionService = {
  getCustomerTransactions: async (customerId, filters) => {
    try {
      // Verify customer exists
      const customer = await customerRepository.findById(customerId);
      if (!customer) {
        throw new ApiError(404, 'Customer not found');
      }

      return customerTransactionRepository.findByCustomer(customerId, filters);
    } catch (error) {
      console.error('Error in getCustomerTransactions:', error);
      throw error;
    }
  },

  getCustomerDebt: async (customerId) => {
    try {
      const customer = await customerRepository.findById(customerId);
      if (!customer) {
        throw new ApiError(404, 'Customer not found');
      }

      const debt = await customerTransactionRepository.getCustomerDebt(customerId);
      return { 
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
        }, 
        debt: parseFloat(debt) || 0 
      };
    } catch (error) {
      console.error('Error in getCustomerDebt:', error);
      throw error;
    }
  },

  recordPayment: async (paymentData, userId) => {
    const { customerId, amount, description } = paymentData;

    // Verify customer exists
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    if (parseFloat(amount) <= 0) {
      throw new ApiError(400, 'Payment amount must be greater than 0');
    }

    // Create payment transaction
    return customerTransactionRepository.create({
      customerId,
      type: 'PAYMENT',
      amount: parseFloat(amount),
      description: description || null,
      createdById: userId,
    });
  },

  createSaleTransaction: async (saleId, customerId) => {
    // This is called automatically when a sale is created with a customer
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { cashier: true },
    });

    if (!sale) {
      throw new ApiError(404, 'Sale not found');
    }

    if (sale.paymentMethod === 'CREDIT' || sale.paymentMethod === 'MIXED') {
      const creditAmount = sale.paymentMethod === 'CREDIT' 
        ? parseFloat(sale.total) 
        : parseFloat(sale.total) - parseFloat(sale.paidAmount);

      if (creditAmount > 0) {
        return customerTransactionRepository.create({
          customerId,
          type: 'SALE',
          amount: creditAmount,
          description: `Satış: ${sale.saleNumber}`,
          saleId: sale.id,
          createdById: sale.cashierId,
        });
      }
    }

    return null;
  },
};

