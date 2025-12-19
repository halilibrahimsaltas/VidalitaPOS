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
  getAvailableProductImages,
} from '../controllers/product.controller.js';
import { authenticate, authorize, hasPermission } from '../middleware/auth.middleware.js';
import { validateCreateProduct, validateUpdateProduct } from '../middleware/product.validation.middleware.js';
import { uploadSingleImage, uploadCSVFile, handleUploadError } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all products (with pagination and filters) - requires products.view permission
router.get('/', hasPermission('products.view'), getAllProducts);

// Get product by ID - requires products.view permission
router.get('/:id', hasPermission('products.view'), getProductById);

// Get product by barcode - requires products.view permission
router.get('/barcode/:barcode', hasPermission('products.view'), getProductByBarcode);

// Get import template (only ADMIN and MANAGER)
router.get('/import/template', authorize('ADMIN', 'MANAGER'), getImportTemplate);

// Get available product images (requires products.view permission)
router.get('/available-images', hasPermission('products.view'), getAvailableProductImages);

// Upload product image (only ADMIN and MANAGER)
router.post('/upload-image', authorize('ADMIN', 'MANAGER'), uploadSingleImage, handleUploadError, uploadProductImage);

// Import products from CSV (only ADMIN and MANAGER)
router.post('/import', authorize('ADMIN', 'MANAGER'), uploadCSVFile, handleUploadError, importProducts);

// Create product - requires products.create permission (CASHIER, MANAGER, ADMIN can create)
router.post('/', hasPermission('products.create'), validateCreateProduct, createProduct);

// Update product - requires products.update permission (CASHIER, MANAGER, ADMIN can update)
router.put('/:id', hasPermission('products.update'), validateUpdateProduct, updateProduct);

// Delete product - requires products.delete permission (CASHIER, MANAGER, ADMIN can delete)
router.delete('/:id', hasPermission('products.delete'), deleteProduct);

export default router;

