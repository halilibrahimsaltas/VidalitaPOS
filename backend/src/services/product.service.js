import { productRepository } from '../repositories/product.repository.js';
import { generateBarcode, validateBarcode } from '../utils/barcode.js';
import { ApiError } from '../utils/ApiError.js';

export const productService = {
  getAllProducts: async (filters) => {
    return productRepository.findAll(filters);
  },

  getProductById: async (id) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  },

  getProductByBarcode: async (barcode) => {
    const product = await productRepository.findByBarcode(barcode);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  },

  createProduct: async (productData) => {
    const { barcode, sku, categoryId } = productData;

    // Generate barcode if not provided
    if (!barcode) {
      productData.barcode = generateBarcode();
    } else {
      // Validate barcode format
      if (!validateBarcode(barcode)) {
        throw new ApiError(400, 'Invalid barcode format');
      }

      // Check if barcode already exists
      const existingBarcode = await productRepository.findByBarcode(barcode);
      if (existingBarcode) {
        throw new ApiError(400, 'Barcode already exists');
      }
    }

    // Check if SKU already exists
    if (sku) {
      const existingSku = await productRepository.findBySku(sku);
      if (existingSku) {
        throw new ApiError(400, 'SKU already exists');
      }
    }

    // Validate category if provided
    if (categoryId) {
      const { categoryRepository } = await import('../repositories/category.repository.js');
      const category = await categoryRepository.findById(categoryId);
      if (!category) {
        throw new ApiError(400, 'Category not found');
      }
    }

    // Convert price and costPrice to Decimal
    if (productData.price) {
      productData.price = parseFloat(productData.price);
    }
    if (productData.costPrice) {
      productData.costPrice = parseFloat(productData.costPrice);
    }

    return productRepository.create(productData);
  },

  updateProduct: async (id, productData) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // If barcode is being updated
    if (productData.barcode && productData.barcode !== product.barcode) {
      if (!validateBarcode(productData.barcode)) {
        throw new ApiError(400, 'Invalid barcode format');
      }

      const existingBarcode = await productRepository.findByBarcode(productData.barcode);
      if (existingBarcode) {
        throw new ApiError(400, 'Barcode already exists');
      }
    }

    // If SKU is being updated
    if (productData.sku && productData.sku !== product.sku) {
      const existingSku = await productRepository.findBySku(productData.sku);
      if (existingSku) {
        throw new ApiError(400, 'SKU already exists');
      }
    }

    // Validate category if being updated
    if (productData.categoryId !== undefined && productData.categoryId !== product.categoryId) {
      if (productData.categoryId) {
        const { categoryRepository } = await import('../repositories/category.repository.js');
        const category = await categoryRepository.findById(productData.categoryId);
        if (!category) {
          throw new ApiError(400, 'Category not found');
        }
      }
    }

    // Convert price and costPrice to Decimal
    if (productData.price !== undefined) {
      productData.price = parseFloat(productData.price);
    }
    if (productData.costPrice !== undefined) {
      productData.costPrice = parseFloat(productData.costPrice);
    }

    return productRepository.update(id, productData);
  },

  deleteProduct: async (id) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return productRepository.delete(id);
  },
};

