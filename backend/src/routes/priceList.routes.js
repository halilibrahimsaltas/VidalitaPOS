import express from 'express';
import {
  getAllPriceLists,
  getPriceListById,
  getDefaultPriceList,
  createPriceList,
  updatePriceList,
  deletePriceList,
  getProductPrices,
  getPriceListProducts,
  setProductPrice,
  setProductPrices,
  deleteProductPrice,
} from '../controllers/priceList.controller.js';
import { authenticate, authorize, hasPermission } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Price List CRUD operations
// Get all price lists - requires products.view permission
router.get('/', hasPermission('products.view'), getAllPriceLists);

// Get default price list
router.get('/default', hasPermission('products.view'), getDefaultPriceList);

// Get price list by ID
router.get('/:id', hasPermission('products.view'), getPriceListById);

// Create price list - requires products.create permission
router.post('/', hasPermission('products.create'), createPriceList);

// Update price list - requires products.update permission
router.put('/:id', hasPermission('products.update'), updatePriceList);

// Delete price list - requires products.delete permission
router.delete('/:id', hasPermission('products.delete'), deletePriceList);

// Product Price operations
// Get all prices for a product
router.get('/products/:productId/prices', hasPermission('products.view'), getProductPrices);

// Get all products in a price list
router.get('/:priceListId/products', hasPermission('products.view'), getPriceListProducts);

// Set product price for a price list
router.post('/products/:productId/prices/:priceListId', hasPermission('products.update'), setProductPrice);

// Set multiple product prices at once
router.post('/products/:productId/prices', hasPermission('products.update'), setProductPrices);

// Delete product price
router.delete('/products/:productId/prices/:priceListId', hasPermission('products.delete'), deleteProductPrice);

export default router;

