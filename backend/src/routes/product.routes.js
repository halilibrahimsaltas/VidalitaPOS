import express from 'express';
import {
  getAllProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  importProducts,
  getImportTemplate,
} from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateCreateProduct, validateUpdateProduct } from '../middleware/product.validation.middleware.js';
import { uploadSingleImage, uploadCSVFile, handleUploadError } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all products (with pagination and filters)
router.get('/', getAllProducts);

// Get product by ID
router.get('/:id', getProductById);

// Get product by barcode
router.get('/barcode/:barcode', getProductByBarcode);

// Get import template
router.get('/import/template', authorize('ADMIN', 'MANAGER'), getImportTemplate);

// Upload product image (only ADMIN and MANAGER)
router.post('/upload-image', authorize('ADMIN', 'MANAGER'), uploadSingleImage, handleUploadError, uploadProductImage);

// Import products from CSV (only ADMIN and MANAGER)
router.post('/import', authorize('ADMIN', 'MANAGER'), uploadCSVFile, handleUploadError, importProducts);

// Create product (only ADMIN and MANAGER)
router.post('/', authorize('ADMIN', 'MANAGER'), validateCreateProduct, createProduct);

// Update product (only ADMIN and MANAGER)
router.put('/:id', authorize('ADMIN', 'MANAGER'), validateUpdateProduct, updateProduct);

// Delete product (only ADMIN)
router.delete('/:id', authorize('ADMIN'), deleteProduct);

export default router;

