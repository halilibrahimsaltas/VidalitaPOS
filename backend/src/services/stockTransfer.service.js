import { stockTransferRepository } from '../repositories/stockTransfer.repository.js';
import inventoryService from './inventory.service.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';

export const stockTransferService = {
  getAllTransfers: async (filters) => {
    return stockTransferRepository.findAll(filters);
  },

  getTransferById: async (id) => {
    const transfer = await stockTransferRepository.findById(id);
    if (!transfer) {
      throw new ApiError(404, 'Stock transfer not found');
    }
    return transfer;
  },

  createTransfer: async (transferData, userId) => {
    const { fromBranchId, toBranchId, items } = transferData;

    // Verify branches exist
    const [fromBranch, toBranch] = await Promise.all([
      prisma.branch.findUnique({ where: { id: fromBranchId } }),
      prisma.branch.findUnique({ where: { id: toBranchId } }),
    ]);

    if (!fromBranch) {
      throw new ApiError(404, 'Source branch not found');
    }
    if (!toBranch) {
      throw new ApiError(404, 'Destination branch not found');
    }

    if (fromBranchId === toBranchId) {
      throw new ApiError(400, 'Source and destination branches cannot be the same');
    }

    // Verify all products exist and check stock availability
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new ApiError(404, `Product ${item.productId} not found`);
      }

      // Check if source branch has enough stock
      const inventory = await inventoryService.getInventoryItem(fromBranchId, item.productId).catch(() => null);
      if (!inventory || inventory.quantity < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product ${product.name}`);
      }
    }

    // Create transfer
    const transfer = await stockTransferRepository.create({
      ...transferData,
      createdById: userId,
      status: 'PENDING',
    });

    return transfer;
  },

  completeTransfer: async (id) => {
    const transfer = await stockTransferRepository.findById(id);
    if (!transfer) {
      throw new ApiError(404, 'Stock transfer not found');
    }

    if (transfer.status === 'COMPLETED') {
      throw new ApiError(400, 'Transfer already completed');
    }

    if (transfer.status === 'CANCELLED') {
      throw new ApiError(400, 'Cannot complete cancelled transfer');
    }

    // Process transfer items
    for (const item of transfer.items) {
      // Decrease from source branch
      await inventoryService.updateQuantity(
        transfer.fromBranchId,
        item.productId,
        -item.quantity
      );

      // Increase in destination branch
      const toInventory = await inventoryService.getInventoryItem(
        transfer.toBranchId,
        item.productId
      ).catch(() => null);

      if (toInventory) {
        await inventoryService.updateQuantity(
          transfer.toBranchId,
          item.productId,
          item.quantity
        );
      } else {
        // Create inventory if it doesn't exist
        await inventoryService.createOrUpdateInventory({
          branchId: transfer.toBranchId,
          productId: item.productId,
          quantity: item.quantity,
          minStockLevel: 0,
        });
      }
    }

    // Update transfer status
    return stockTransferRepository.updateStatus(id, 'COMPLETED');
  },

  cancelTransfer: async (id) => {
    const transfer = await stockTransferRepository.findById(id);
    if (!transfer) {
      throw new ApiError(404, 'Stock transfer not found');
    }

    if (transfer.status === 'COMPLETED') {
      throw new ApiError(400, 'Cannot cancel completed transfer');
    }

    if (transfer.status === 'CANCELLED') {
      throw new ApiError(400, 'Transfer already cancelled');
    }

    return stockTransferRepository.updateStatus(id, 'CANCELLED');
  },
};

