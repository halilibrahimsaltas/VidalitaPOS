import express from 'express';
import {
  getAllSales,
  getSaleById,
  getSaleByNumber,
  createSale,
  refundSale,
  getReceipt,
} from '../controllers/sale.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateCreateSale, validateRefundSale } from '../middleware/sale.validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all sales (with filters)
router.get('/', getAllSales);

// Get sale by ID
router.get('/:id', getSaleById);

// Get sale by sale number
router.get('/number/:saleNumber', getSaleByNumber);

// Get receipt
router.get('/:id/receipt', getReceipt);

// Create sale (all authenticated users can create sales)
router.post('/', validateCreateSale, createSale);

// Refund sale (only ADMIN and MANAGER)
router.post('/:id/refund', authorize('ADMIN', 'MANAGER'), validateRefundSale, refundSale);

export default router;

