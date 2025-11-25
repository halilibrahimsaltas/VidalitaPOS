import express from 'express';
import authRoutes from './auth.routes.js';
import branchRoutes from './branch.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);

export default router;

