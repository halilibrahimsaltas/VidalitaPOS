import express from 'express';
import {
  getAllProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateCreateProduct, validateUpdateProduct } from '../middleware/product.validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all products (with pagination and filters)
router.get('/', getAllProducts);

// Get product by ID
router.get('/:id', getProductById);

// Get product by barcode
router.get('/barcode/:barcode', getProductByBarcode);

// Create product (only ADMIN and MANAGER)
router.post('/', authorize('ADMIN', 'MANAGER'), validateCreateProduct, createProduct);

// Update product (only ADMIN and MANAGER)
router.put('/:id', authorize('ADMIN', 'MANAGER'), validateUpdateProduct, updateProduct);

// Delete product (only ADMIN)
router.delete('/:id', authorize('ADMIN'), deleteProduct);

export default router;

