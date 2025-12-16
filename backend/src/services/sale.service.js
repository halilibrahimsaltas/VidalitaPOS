import { saleRepository } from '../repositories/sale.repository.js';
import { generateSaleNumber } from '../utils/saleNumber.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';
import inventoryService from './inventory.service.js';
import cashRegisterTransactionService from './cashRegisterTransaction.service.js';

const saleService = {
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

    // Validate and process items - Sadece fatura kaydı, stok kontrolü yok
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new ApiError(404, `Product ${item.productId} not found`);
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
    if (paidAmount < total && paymentMethod !== 'CREDIT' && paymentMethod !== 'MIXED') {
      throw new ApiError(400, 'Paid amount must be greater than or equal to total');
    }

    const changeAmount = Math.max(0, paidAmount - total);

    // Generate sale number and invoice number
    const saleNumber = await generateSaleNumber(prisma);
    const invoiceNumber = `INV-${saleNumber}`;

    // Update inventory - decrease stock for each item
    for (const item of processedItems) {
      try {
        // Check if inventory exists
        const inventory = await inventoryService.getInventoryItem(branchId, item.productId).catch(() => null);
        
        if (!inventory) {
          throw new ApiError(400, `Ürün stokta bulunamadı: ${item.productId}`);
        }

        // Check stock availability
        if (inventory.quantity < item.quantity) {
          throw new ApiError(400, `Yetersiz stok: ${inventory.product.name} (Mevcut: ${inventory.quantity}, İstenen: ${item.quantity})`);
        }

        // Decrease stock
        await inventoryService.updateQuantity(branchId, item.productId, -item.quantity);
      } catch (error) {
        // If inventory update fails, throw error to rollback
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError(400, `Stok güncellemesi başarısız: ${error.message}`);
      }
    }

    // Create sale with invoice number
    const sale = await saleRepository.create({
      saleNumber,
      invoiceNumber,
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

    // Record cash register transaction (for cash and card payments)
    try {
      await cashRegisterTransactionService.recordSaleIncome(sale, cashierId);
    } catch (error) {
      console.error('Cash register transaction failed during sale:', error);
      // Don't fail the sale if cash register transaction fails
    }

    // Create customer transaction if credit sale
    if (customerId && (paymentMethod === 'CREDIT' || paymentMethod === 'MIXED')) {
      const { customerTransactionService } = await import('./customerTransaction.service.js');
      await customerTransactionService.createSaleTransaction(sale.id, customerId);
    }

    return sale;
  },

  refundSale: async (saleId, refundItems = null, userId) => {
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
    const itemsToRefund = refundItems && refundItems.length > 0 
      ? refundItems 
      : sale.items.map(item => ({ itemId: item.id, quantity: item.quantity }));

    // Process refund - restore inventory
    for (const refundItem of itemsToRefund) {
      const saleItem = sale.items.find((item) => item.id === refundItem.itemId);
      if (!saleItem) {
        throw new ApiError(404, `Sale item ${refundItem.itemId} not found`);
      }

      const refundQuantity = refundItem.quantity || saleItem.quantity;
      if (refundQuantity > saleItem.quantity) {
        throw new ApiError(400, 'Refund quantity cannot exceed sale quantity');
      }

      // Restore inventory (add back to stock) - MUST succeed
      try {
        // Check if inventory exists, create if not
        let inventory = await inventoryService.getInventoryItem(sale.branchId, saleItem.productId).catch(() => null);
        
        if (!inventory) {
          // Create inventory if it doesn't exist
          await inventoryService.createOrUpdateInventory({
            branchId: sale.branchId,
            productId: saleItem.productId,
            quantity: refundQuantity,
            minStockLevel: 0,
          });
        } else {
          await inventoryService.updateQuantity(
            sale.branchId, 
            saleItem.productId, 
            refundQuantity // Positive value adds to stock
          );
        }
      } catch (error) {
        // If inventory update fails, throw error to prevent partial refund
        throw new ApiError(400, `Stok güncellemesi başarısız: ${error.message}`);
      }
    }

    // Calculate refunded amount
    let refundedAmount = 0;
    for (const refundItem of itemsToRefund) {
      const saleItem = sale.items.find((item) => item.id === refundItem.itemId);
      const refundQuantity = refundItem.quantity || saleItem.quantity;
      const itemRefundAmount = (parseFloat(saleItem.unitPrice) * refundQuantity) - parseFloat(saleItem.discount || 0);
      refundedAmount += itemRefundAmount;
    }

    // Update sale status
    const allRefunded = itemsToRefund.every((refundItem) => {
      const saleItem = sale.items.find((item) => item.id === refundItem.itemId);
      return (refundItem.quantity || saleItem.quantity) === saleItem.quantity;
    });

    const newStatus = allRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

    // Record cash register transaction (outflow for refund)
    try {
      await cashRegisterTransactionService.recordRefundOutflow(sale, refundedAmount, userId);
    } catch (error) {
      console.error('Cash register transaction failed during refund:', error);
      // Don't fail the refund if cash register transaction fails
    }

    // Update customer transaction if credit sale
    if (sale.customerId && (sale.paymentMethod === 'CREDIT' || sale.paymentMethod === 'MIXED')) {
      try {
        const { customerTransactionService } = await import('./customerTransaction.service.js');
        // Create refund transaction (negative amount)
        await customerTransactionService.createTransaction({
          customerId: sale.customerId,
          type: 'ADJUSTMENT',
          amount: -refundedAmount,
          description: `İade - ${sale.saleNumber}`,
          saleId: sale.id,
          createdById: userId,
        });
      } catch (error) {
        console.error('Customer transaction update failed during refund:', error);
      }
    }

    return saleRepository.updateStatus(saleId, newStatus);
  },

  cancelSale: async (saleId, userId) => {
    const sale = await saleRepository.findById(saleId);
    if (!sale) {
      throw new ApiError(404, 'Sale not found');
    }

    if (sale.status === 'CANCELLED') {
      throw new ApiError(400, 'Sale already cancelled');
    }

    if (sale.status === 'REFUNDED' || sale.status === 'PARTIALLY_REFUNDED') {
      throw new ApiError(400, 'Cannot cancel refunded sale');
    }

    // Restore inventory for all items - MUST succeed
    for (const saleItem of sale.items) {
      try {
        // Check if inventory exists, create if not
        let inventory = await inventoryService.getInventoryItem(sale.branchId, saleItem.productId).catch(() => null);
        
        if (!inventory) {
          // Create inventory if it doesn't exist
          await inventoryService.createOrUpdateInventory({
            branchId: sale.branchId,
            productId: saleItem.productId,
            quantity: saleItem.quantity,
            minStockLevel: 0,
          });
        } else {
          await inventoryService.updateQuantity(
            sale.branchId,
            saleItem.productId,
            saleItem.quantity // Positive value adds to stock
          );
        }
      } catch (error) {
        // If inventory update fails, throw error to prevent cancellation
        throw new ApiError(400, `Stok güncellemesi başarısız: ${error.message}`);
      }
    }

    // Record cash register transaction (outflow for cancellation)
    try {
      await cashRegisterTransactionService.recordCancelOutflow(sale, userId);
    } catch (error) {
      console.error('Cash register transaction failed during cancellation:', error);
      // Don't fail the cancellation if cash register transaction fails
    }

    // Update customer transaction if credit sale
    if (sale.customerId && (sale.paymentMethod === 'CREDIT' || sale.paymentMethod === 'MIXED')) {
      try {
        const { customerTransactionService } = await import('./customerTransaction.service.js');
        // Create cancellation transaction (negative amount)
        await customerTransactionService.createTransaction({
          customerId: sale.customerId,
          type: 'ADJUSTMENT',
          amount: -parseFloat(sale.total),
          description: `İptal - ${sale.saleNumber}`,
          saleId: sale.id,
          createdById: userId,
        });
      } catch (error) {
        console.error('Customer transaction update failed during cancellation:', error);
      }
    }

    return saleRepository.updateStatus(saleId, 'CANCELLED');
  },
};

export default saleService;

