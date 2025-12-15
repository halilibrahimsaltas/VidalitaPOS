import { inventoryRepository } from '../repositories/inventory.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';

const inventoryService = {
  getAllInventory: async (filters) => {
    return inventoryRepository.findAll(filters);
  },

  getInventoryByBranch: async (branchId) => {
    // Verify branch exists
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }

    return inventoryRepository.findByBranch(branchId);
  },

  getInventoryByProduct: async (productId) => {
    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return inventoryRepository.findByProduct(productId);
  },

  getInventoryItem: async (branchId, productId) => {
    const inventory = await inventoryRepository.findByBranchAndProduct(branchId, productId);
    if (!inventory) {
      throw new ApiError(404, 'Inventory item not found');
    }
    return inventory;
  },

  createOrUpdateInventory: async (inventoryData) => {
    const { branchId, productId } = inventoryData;

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

    // Check if inventory exists
    const existing = await inventoryRepository.findByBranchAndProduct(branchId, productId);

    if (existing) {
      return inventoryRepository.update(branchId, productId, inventoryData);
    } else {
      return inventoryRepository.create(inventoryData);
    }
  },

  updateQuantity: async (branchId, productId, quantityChange) => {
    const inventory = await inventoryRepository.findByBranchAndProduct(branchId, productId);

    if (!inventory) {
      throw new ApiError(404, 'Inventory item not found');
    }

    const newQuantity = inventory.quantity + quantityChange;

    if (newQuantity < 0) {
      throw new ApiError(400, 'Insufficient stock');
    }

    return inventoryRepository.updateQuantity(branchId, productId, quantityChange);
  },

  getLowStockItems: async (branchId = null) => {
    return inventoryRepository.getLowStockItems(branchId);
  },
};

export default inventoryService;

