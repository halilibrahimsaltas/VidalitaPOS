import { ApiResponse } from '../utils/ApiResponse.js';
import productService from '../services/product.service.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      categoryId: req.query.categoryId,
      isActive: req.query.isActive,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await productService.getAllProducts(filters);
    res.json(ApiResponse.success(result, 'Products retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    res.json(ApiResponse.success(product, 'Product retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProductByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    const product = await productService.getProductByBarcode(barcode);
    res.json(ApiResponse.success(product, 'Product retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(ApiResponse.success(product, 'Product created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    res.json(ApiResponse.success(product, 'Product updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.json(ApiResponse.success(null, 'Product deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const result = await productService.uploadProductImage(req.file);
    res.json(ApiResponse.success(result, 'Image uploaded successfully'));
  } catch (error) {
    next(error);
  }
};

export const importProducts = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const result = await productService.importProducts(req.file);
    res.json(ApiResponse.success(result, 'Products imported successfully'));
  } catch (error) {
    next(error);
  }
};

export const getImportTemplate = async (req, res, next) => {
  try {
    const { generateCSVTemplate } = await import('../utils/csvParser.js');
    const template = generateCSVTemplate();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="product-import-template.csv"');
    res.send(template);
  } catch (error) {
    next(error);
  }
};

export const getAvailableProductImages = async (req, res, next) => {
  try {
    const images = await productService.getAvailableProductImages();
    res.json(ApiResponse.success(images, 'Product images retrieved successfully'));
  } catch (error) {
    next(error);
  }
};