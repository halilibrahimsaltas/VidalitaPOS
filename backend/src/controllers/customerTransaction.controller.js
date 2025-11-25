import { ApiResponse } from '../utils/ApiResponse.js';
import * as customerTransactionService from '../services/customerTransaction.service.js';

export const getCustomerTransactions = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
    };

    const result = await customerTransactionService.getCustomerTransactions(customerId, filters);
    res.json(ApiResponse.success(result, 'Transactions retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getCustomerDebt = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const result = await customerTransactionService.getCustomerDebt(customerId);
    res.json(ApiResponse.success(result, 'Customer debt retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const transaction = await customerTransactionService.recordPayment(
      { ...req.body, customerId },
      req.user.id
    );
    res.status(201).json(ApiResponse.success(transaction, 'Payment recorded successfully'));
  } catch (error) {
    next(error);
  }
};

