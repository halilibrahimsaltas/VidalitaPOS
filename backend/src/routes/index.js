import express from 'express';
import authRoutes from './auth.routes.js';
import branchRoutes from './branch.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

export default router;

