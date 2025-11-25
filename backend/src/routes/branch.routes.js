import express from 'express';
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branch.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateCreateBranch, validateUpdateBranch } from '../middleware/branch.validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all branches (with pagination and filters)
router.get('/', getAllBranches);

// Get branch by ID
router.get('/:id', getBranchById);

// Create branch (only ADMIN and MANAGER)
router.post('/', authorize('ADMIN', 'MANAGER'), validateCreateBranch, createBranch);

// Update branch (only ADMIN and MANAGER)
router.put('/:id', authorize('ADMIN', 'MANAGER'), validateUpdateBranch, updateBranch);

// Delete branch (only ADMIN)
router.delete('/:id', authorize('ADMIN'), deleteBranch);

export default router;

