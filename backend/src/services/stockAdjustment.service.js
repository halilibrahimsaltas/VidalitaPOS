import { stockAdjustmentRepository } from '../repositories/stockAdjustment.repository.js';
import inventoryService from './inventory.service.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';

export const stockAdjustmentService = {
  getAllAdjustments: async (filters) => {
    return stockAdjustmentRepository.findAll(filters);
  },

  getAdjustmentById: async (id) => {
    const adjustment = await stockAdjustmentRepository.findById(id);
    if (!adjustment) {
      throw new ApiError(404, 'Stock adjustment not found');
    }
    return adjustment;
  },

  createAdjustment: async (adjustmentData, userId) => {
    const { branchId, productId, quantity } = adjustmentData;

    // Verify branch and product exist
    const [branch, product] = await Promise.all([
      prisma.branch.findUnique({ where: { id: branchId } }),
      prisma.product.findUnique({ where: { id: productId } }),
    ]);

    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Get current inventory
    const inventory = await inventoryService.getInventoryItem(branchId, productId).catch(() => null);

    if (!inventory) {
      throw new ApiError(404, 'Inventory item not found. Please create inventory first.');
    }

    // Calculate new quantity
    const newQuantity = inventory.quantity + quantity;

    if (newQuantity < 0) {
      throw new ApiError(400, 'Adjustment would result in negative stock');
    }

    // Create adjustment record
    const adjustment = await stockAdjustmentRepository.create({
      ...adjustmentData,
      createdById: userId,
    });

    // Update inventory quantity
    await inventoryService.updateQuantity(branchId, productId, quantity);

    return adjustment;
  },
};

