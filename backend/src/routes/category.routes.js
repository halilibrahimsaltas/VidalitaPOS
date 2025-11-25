import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  getRootCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateCreateCategory, validateUpdateCategory } from '../middleware/category.validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all categories
router.get('/', getAllCategories);

// Get root categories (hierarchical)
router.get('/roots', getRootCategories);

// Get category by ID
router.get('/:id', getCategoryById);

// Create category (only ADMIN and MANAGER)
router.post('/', authorize('ADMIN', 'MANAGER'), validateCreateCategory, createCategory);

// Update category (only ADMIN and MANAGER)
router.put('/:id', authorize('ADMIN', 'MANAGER'), validateUpdateCategory, updateCategory);

// Delete category (only ADMIN)
router.delete('/:id', authorize('ADMIN'), deleteCategory);

export default router;

