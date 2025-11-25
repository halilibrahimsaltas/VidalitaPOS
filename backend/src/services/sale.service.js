import { saleRepository } from '../repositories/sale.repository.js';
import { generateSaleNumber } from '../utils/saleNumber.js';
import { inventoryService } from './inventory.service.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';

export const saleService = {
  getAllSales: async (filters) => {
    return saleRepository.findAll(filters);
  },

  getSaleById: async (id) => {
    const sale = await saleRepository.findById(id);
    if (!sale) {
      throw new ApiError(404, 'Sale not found');
    }
    return sale;
  },

  getSaleByNumber: async (saleNumber) => {
    const sale = await saleRepository.findBySaleNumber(saleNumber);
    if (!sale) {
      throw new ApiError(404, 'Sale not found');
    }
    return sale;
  },

  createSale: async (saleData, cashierId) => {
    const { branchId, items, customerId, paymentMethod, discount = 0, notes } = saleData;

    // Verify branch exists
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }

    // Verify customer if provided
    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        throw new ApiError(404, 'Customer not found');
      }
    }

    // Validate and process items
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new ApiError(404, `Product ${item.productId} not found`);
      }

      if (!product.isActive) {
        throw new ApiError(400, `Product ${product.name} is not active`);
      }

      // Check inventory
      const inventory = await inventoryService.getInventoryItem(branchId, item.productId).catch(() => null);
      if (!inventory || inventory.quantity < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product ${product.name}`);
      }

      const unitPrice = parseFloat(item.unitPrice || product.price);
      const itemDiscount = parseFloat(item.discount || 0);
      const itemTotal = (unitPrice * item.quantity) - itemDiscount;

      subtotal += itemTotal;

      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        discount: itemDiscount,
        total: itemTotal,
      });
    }

    if (processedItems.length === 0) {
      throw new ApiError(400, 'Sale must have at least one item');
    }

    // Calculate totals
    const finalDiscount = parseFloat(discount);
    const tax = 0; // Tax calculation can be added later
    const total = subtotal - finalDiscount + tax;

    // Validate payment
    const paidAmount = parseFloat(saleData.paidAmount || total);
    if (paidAmount < total && paymentMethod !== 'CREDIT') {
      throw new ApiError(400, 'Paid amount must be greater than or equal to total');
    }

    const changeAmount = Math.max(0, paidAmount - total);

    // Generate sale number
    const saleNumber = await generateSaleNumber(prisma);

    // Create sale
    const sale = await saleRepository.create({
      saleNumber,
      branchId,
      customerId: customerId || null,
      cashierId,
      paymentMethod,
      subtotal,
      discount: finalDiscount,
      tax,
      total,
      paidAmount,
      changeAmount,
      notes: notes || null,
      status: 'COMPLETED',
      items: processedItems,
    });

    // Update inventory for each item
    for (const item of processedItems) {
      await inventoryService.updateQuantity(branchId, item.productId, -item.quantity);
    }

    // Create customer transaction if credit sale
    if (customerId && (paymentMethod === 'CREDIT' || paymentMethod === 'MIXED')) {
      const { customerTransactionService } = await import('./customerTransaction.service.js');
      await customerTransactionService.createSaleTransaction(sale.id, customerId);
    }

    return sale;
  },

  refundSale: async (saleId, refundItems = null) => {
    const sale = await saleRepository.findById(saleId);
    if (!sale) {
      throw new ApiError(404, 'Sale not found');
    }

    if (sale.status === 'REFUNDED') {
      throw new ApiError(400, 'Sale already refunded');
    }

    if (sale.status === 'CANCELLED') {
      throw new ApiError(400, 'Cannot refund cancelled sale');
    }

    // If no items specified, refund all items
    const itemsToRefund = refundItems || sale.items;

    // Process refund
    for (const refundItem of itemsToRefund) {
      const saleItem = sale.items.find((item) => item.id === refundItem.itemId);
      if (!saleItem) {
        throw new ApiError(404, `Sale item ${refundItem.itemId} not found`);
      }

      const refundQuantity = refundItem.quantity || saleItem.quantity;
      if (refundQuantity > saleItem.quantity) {
        throw new ApiError(400, 'Refund quantity cannot exceed sale quantity');
      }

      // Restore inventory
      await inventoryService.updateQuantity(sale.branchId, saleItem.productId, refundQuantity);
    }

    // Update sale status
    const allRefunded = itemsToRefund.every((refundItem) => {
      const saleItem = sale.items.find((item) => item.id === refundItem.itemId);
      return (refundItem.quantity || saleItem.quantity) === saleItem.quantity;
    });

    const newStatus = allRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

    return saleRepository.updateStatus(saleId, newStatus);
  },
};

