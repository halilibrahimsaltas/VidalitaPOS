import express from 'express';
import {
  getAllAdjustments,
  getAdjustmentById,
  createAdjustment,
} from '../controllers/stockAdjustment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateCreateStockAdjustment } from '../middleware/inventory.validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all adjustments (with filters)
router.get('/', getAllAdjustments);

// Get adjustment by ID
router.get('/:id', getAdjustmentById);

// Create adjustment (only ADMIN and MANAGER)
router.post('/', authorize('ADMIN', 'MANAGER'), validateCreateStockAdjustment, createAdjustment);

export default router;

