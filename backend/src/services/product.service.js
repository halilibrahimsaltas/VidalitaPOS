import { productRepository } from '../repositories/product.repository.js';
import { generateBarcode, validateBarcode } from '../utils/barcode.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadToLocal, deleteLocalFile, UPLOAD_DIR, UPLOAD_URL } from '../config/s3.js';
import { prisma } from '../config/database.js';
import fs from 'fs/promises';
import path from 'path';

const productService = {
  getAllProducts: async (filters) => {
    return productRepository.findAll(filters);
  },

  getProductById: async (id) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    // Include inventory data
    const { inventoryRepository } = await import('../repositories/inventory.repository.js');
    const inventory = await inventoryRepository.findByProduct(id);
    return { ...product, inventory };
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

    // Normalize barcode (trim and check if empty)
    const normalizedBarcode = barcode?.trim() || null;

    // Generate barcode if not provided
    if (!normalizedBarcode || normalizedBarcode === '') {
      productData.barcode = generateBarcode();
    } else {
      // Validate barcode format
      if (!validateBarcode(normalizedBarcode)) {
        throw new ApiError(400, 'Invalid barcode format');
      }

      // Check if barcode already exists
      const existingBarcode = await productRepository.findByBarcode(normalizedBarcode);
      if (existingBarcode) {
        throw new ApiError(400, `Bu barkod numarası zaten kullanılıyor. Ürün: ${existingBarcode.name}`);
      }

      productData.barcode = normalizedBarcode;
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

    // Convert price to Decimal
    if (productData.price) {
      productData.price = parseFloat(productData.price);
    }

    // Set default currency if not provided
    if (!productData.currency) {
      productData.currency = 'UZS';
    }

    // Handle imageUrl - if it's a file upload result, use the URL
    if (productData.imageUrl && typeof productData.imageUrl === 'object') {
      productData.imageUrl = productData.imageUrl.url;
    }

    // Extract inventory and price list data if provided
    const { inventory, priceListPrices, ...productFields } = productData;

    // Create product
    const product = await productRepository.create(productFields);

    // Create inventory if inventory data is provided
    if (inventory && inventory.branchId) {
      const inventoryService = (await import('./inventory.service.js')).default;
      try {
        await inventoryService.createOrUpdateInventory({
          branchId: inventory.branchId,
          productId: product.id,
          quantity: inventory.quantity || 0,
          minStockLevel: inventory.minStockLevel || 0,
          maxStockLevel: inventory.maxStockLevel || null,
        });
      } catch (error) {
        console.error('Error creating inventory:', error);
        // Continue even if inventory creation fails
      }
    }

    // Create price list prices if provided
    // priceListPrices should be an array of { priceListId, price }
    if (priceListPrices && Array.isArray(priceListPrices)) {
      const { productPriceRepository } = await import('../repositories/priceList.repository.js');
      for (const { priceListId, price } of priceListPrices) {
        if (priceListId && price !== undefined && price !== null) {
          try {
            await productPriceRepository.upsert(product.id, priceListId, parseFloat(price));
          } catch (error) {
            console.error(`Error setting price for price list ${priceListId}:`, error);
            // Continue even if price setting fails
          }
        }
      }
    }

    // Fetch product with price list prices
    const productWithPrices = await productRepository.findById(product.id);
    return productWithPrices;
  },

  updateProduct: async (id, productData) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // If barcode is being updated
    if (productData.barcode !== undefined) {
      const normalizedBarcode = productData.barcode?.trim() || null;
      
      // If barcode is being cleared, set to null
      if (!normalizedBarcode || normalizedBarcode === '') {
        productData.barcode = null;
      } else if (normalizedBarcode !== product.barcode) {
        // Barcode is being changed
        if (!validateBarcode(normalizedBarcode)) {
          throw new ApiError(400, 'Invalid barcode format');
        }

        const existingBarcode = await productRepository.findByBarcode(normalizedBarcode);
        if (existingBarcode) {
          throw new ApiError(400, `Bu barkod numarası zaten kullanılıyor. Ürün: ${existingBarcode.name}`);
        }

        productData.barcode = normalizedBarcode;
      } else {
        // Barcode hasn't changed, keep it
        productData.barcode = product.barcode;
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

    // Convert price to Decimal
    if (productData.price !== undefined) {
      productData.price = parseFloat(productData.price);
    }

    // Handle imageUrl - if it's a file upload result, use the URL
    if (productData.imageUrl && typeof productData.imageUrl === 'object') {
      productData.imageUrl = productData.imageUrl.url;
    }

    // Delete old image from local storage if imageUrl is being updated
    if (productData.imageUrl && product.imageUrl && productData.imageUrl !== product.imageUrl) {
      try {
        await deleteLocalFile(product.imageUrl);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Extract inventory and price list data if provided
    const { inventory, priceListPrices, ...productFields } = productData;

    // Update product
    const updatedProduct = await productRepository.update(id, productFields);

    // Update inventory if inventory data is provided
    if (inventory && inventory.branchId) {
      const inventoryService = (await import('./inventory.service.js')).default;
      try {
        const inventoryUpdateData = {
          branchId: inventory.branchId,
          productId: updatedProduct.id,
        };
        // Only include fields that are explicitly provided
        if (inventory.quantity !== undefined) inventoryUpdateData.quantity = inventory.quantity;
        if (inventory.minStockLevel !== undefined) inventoryUpdateData.minStockLevel = inventory.minStockLevel;
        if (inventory.maxStockLevel !== undefined) inventoryUpdateData.maxStockLevel = inventory.maxStockLevel;
        
        await inventoryService.createOrUpdateInventory(inventoryUpdateData);
      } catch (error) {
        console.error('Error updating inventory:', error);
        // Continue even if inventory update fails
      }
    }

    // Update price list prices if provided
    // priceListPrices should be an array of { priceListId, price }
    if (priceListPrices && Array.isArray(priceListPrices)) {
      const { productPriceRepository } = await import('../repositories/priceList.repository.js');
      for (const { priceListId, price } of priceListPrices) {
        if (priceListId && price !== undefined && price !== null) {
          try {
            await productPriceRepository.upsert(updatedProduct.id, priceListId, parseFloat(price));
          } catch (error) {
            console.error(`Error setting price for price list ${priceListId}:`, error);
            // Continue even if price setting fails
          }
        }
      }
    }

    // Fetch product with price list prices
    const productWithPrices = await productRepository.findById(updatedProduct.id);
    return productWithPrices;
  },

  deleteProduct: async (id) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check if product has sale items
    const saleItems = await prisma.saleItem.findFirst({
      where: { productId: id },
    });
    if (saleItems) {
      throw new ApiError(400, 'Ürün satış kayıtlarında kullanılıyor. Ürün silinemez.');
    }

    // Delete inventory records (cascade delete)
    const { inventoryRepository } = await import('../repositories/inventory.repository.js');
    try {
      const inventory = await inventoryRepository.findByProduct(id);
      if (inventory && inventory.length > 0) {
        // Delete all inventory records for this product
        await prisma.inventory.deleteMany({
          where: { productId: id },
        });
      }
    } catch (error) {
      console.error('Error deleting inventory records:', error);
      // Continue even if inventory deletion fails
    }

    // Delete product prices
    const { productPriceRepository } = await import('../repositories/priceList.repository.js');
    try {
      await productPriceRepository.deleteByProduct(id);
    } catch (error) {
      console.error('Error deleting product prices:', error);
      // Continue even if price deletion fails
    }

    // Delete image from local storage if exists
    if (product.imageUrl) {
      try {
        await deleteLocalFile(product.imageUrl);
      } catch (error) {
        console.error('Error deleting image:', error);
        // Continue with product deletion even if image deletion fails
      }
    }

    return productRepository.delete(id);
  },

  uploadProductImage: async (file) => {
    return uploadToLocal(file, 'products');
  },

  getAvailableProductImages: async () => {
    try {
      const productsDir = path.join(UPLOAD_DIR, 'products');
      
      // Check if directory exists
      try {
        await fs.access(productsDir);
      } catch (error) {
        // Directory doesn't exist, return empty array
        return [];
      }

      // Read directory contents
      const files = await fs.readdir(productsDir);
      
      // Filter only image files and return their names
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
      const imageFiles = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return imageExtensions.includes(ext);
        })
        .map(file => ({
          name: file,
          url: `${UPLOAD_URL}/products/${file}`,
        }));

      return imageFiles;
    } catch (error) {
      console.error('Error reading product images directory:', error);
      throw new ApiError(500, 'Failed to read product images');
    }
  },

  importProducts: async (file) => {
    const { parseCSV } = await import('../utils/csvParser.js');
    
    // Convert buffer to string
    const csvContent = file.buffer.toString('utf-8');
    const { products, errors } = parseCSV(csvContent);

    if (products.length === 0) {
      throw new ApiError(400, 'No valid products found in CSV file');
    }

    // Import products
    const results = {
      total: products.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const productData of products) {
      try {
        await productService.createProduct(productData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          product: productData.name || 'Unknown',
          error: error.message,
        });
      }
    }

    if (errors) {
      results.errors.push(...errors.map((e) => ({ product: 'CSV', error: e })));
    }

    return results;
  },
};

export default productService;

