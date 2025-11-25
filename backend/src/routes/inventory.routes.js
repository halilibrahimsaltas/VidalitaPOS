import express from 'express';
import {
  getAllInventory,
  getInventoryByBranch,
  getInventoryByProduct,
  getInventoryItem,
  createOrUpdateInventory,
  getLowStockItems,
} from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateCreateOrUpdateInventory } from '../middleware/inventory.validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all inventory (with filters)
router.get('/', getAllInventory);

// Get low stock items
router.get('/low-stock', getLowStockItems);

// Get inventory by branch
router.get('/branch/:branchId', getInventoryByBranch);

// Get inventory by product
router.get('/product/:productId', getInventoryByProduct);

// Get specific inventory item
router.get('/:branchId/:productId', getInventoryItem);

// Create or update inventory (only ADMIN and MANAGER)
router.post('/', authorize('ADMIN', 'MANAGER'), validateCreateOrUpdateInventory, createOrUpdateInventory);

export default router;

