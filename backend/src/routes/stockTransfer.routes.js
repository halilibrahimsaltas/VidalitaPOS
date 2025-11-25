import express from 'express';
import {
  getAllTransfers,
  getTransferById,
  createTransfer,
  completeTransfer,
  cancelTransfer,
} from '../controllers/stockTransfer.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateCreateStockTransfer } from '../middleware/inventory.validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all transfers (with filters)
router.get('/', getAllTransfers);

// Get transfer by ID
router.get('/:id', getTransferById);

// Create transfer (only ADMIN and MANAGER)
router.post('/', authorize('ADMIN', 'MANAGER'), validateCreateStockTransfer, createTransfer);

// Complete transfer (only ADMIN and MANAGER)
router.post('/:id/complete', authorize('ADMIN', 'MANAGER'), completeTransfer);

// Cancel transfer (only ADMIN and MANAGER)
router.post('/:id/cancel', authorize('ADMIN', 'MANAGER'), cancelTransfer);

export default router;

