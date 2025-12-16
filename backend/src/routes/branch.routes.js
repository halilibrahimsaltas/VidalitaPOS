import express from 'express';
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branch.controller.js';
import { authenticate, authorize, hasPermission } from '../middleware/auth.middleware.js';
import { validateCreateBranch, validateUpdateBranch } from '../middleware/branch.validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all branches (with pagination and filters)
// Can use hasPermission('branches.view') or keep authorize for backward compatibility
router.get('/', getAllBranches);

// Get branch by ID
router.get('/:id', getBranchById);

// Create branch - ADMIN or users with branches.create permission
router.post('/', 
  (req, res, next) => {
    if (req.user.role === 'ADMIN') {
      return next();
    }
    return hasPermission('branches.create')(req, res, next);
  },
  validateCreateBranch, 
  createBranch
);

// Update branch - ADMIN or users with branches.update permission
router.put('/:id', 
  (req, res, next) => {
    if (req.user.role === 'ADMIN') {
      return next();
    }
    return hasPermission('branches.update')(req, res, next);
  },
  validateUpdateBranch, 
  updateBranch
);

// Delete branch - ADMIN or users with branches.delete permission
router.delete('/:id', 
  (req, res, next) => {
    if (req.user.role === 'ADMIN') {
      return next();
    }
    return hasPermission('branches.delete')(req, res, next);
  },
  deleteBranch
);

export default router;

