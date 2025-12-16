import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStatistics,
} from '../controllers/customer.controller.js';
import {
  getCustomerTransactions,
  getCustomerDebt,
  recordPayment,
} from '../controllers/customerTransaction.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateCreateCustomer, validateUpdateCustomer, validateRecordPayment } from '../middleware/customer.validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all customers (with filters)
router.get('/', getAllCustomers);

// Get customer by ID
router.get('/:id', getCustomerById);

// Get customer transactions
router.get('/:id/transactions', getCustomerTransactions);

// Get customer debt
router.get('/:id/debt', getCustomerDebt);

// Get customer statistics
router.get('/:id/statistics', getCustomerStatistics);

// Create customer (all authenticated users)
router.post('/', validateCreateCustomer, createCustomer);

// Update customer (only ADMIN and MANAGER)
router.put('/:id', authorize('ADMIN', 'MANAGER'), validateUpdateCustomer, updateCustomer);

// Delete customer (only ADMIN)
router.delete('/:id', authorize('ADMIN'), deleteCustomer);

// Record payment (all authenticated users)
router.post('/:id/payments', validateRecordPayment, recordPayment);

export default router;

