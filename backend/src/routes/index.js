import express from 'express';
import authRoutes from './auth.routes.js';
import branchRoutes from './branch.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import inventoryRoutes from './inventory.routes.js';
import stockTransferRoutes from './stockTransfer.routes.js';
import stockAdjustmentRoutes from './stockAdjustment.routes.js';
import saleRoutes from './sale.routes.js';
import customerRoutes from './customer.routes.js';
import reportRoutes from './report.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/stock-transfers', stockTransferRoutes);
router.use('/stock-adjustments', stockAdjustmentRoutes);
router.use('/sales', saleRoutes);
router.use('/customers', customerRoutes);
router.use('/reports', reportRoutes);

export default router;

