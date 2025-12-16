import express from 'express';
import {
  getAllSales,
  getSaleById,
  getSaleByNumber,
  createSale,
  refundSale,
  cancelSale,
  getReceipt,
} from '../controllers/sale.controller.js';
import { authenticate, authorize, hasPermission } from '../middleware/auth.middleware.js';
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

// Refund sale - ADMIN, MANAGER or users with sales.refund permission
router.post('/:id/refund', 
  (req, res, next) => {
    if (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') {
      return next();
    }
    return hasPermission('sales.refund')(req, res, next);
  },
  validateRefundSale, 
  refundSale
);

// Cancel sale - ADMIN, MANAGER or users with sales.refund permission
router.post('/:id/cancel', 
  (req, res, next) => {
    if (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') {
      return next();
    }
    return hasPermission('sales.refund')(req, res, next);
  },
  cancelSale
);

export default router;

