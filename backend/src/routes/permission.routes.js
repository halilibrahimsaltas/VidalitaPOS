import express from 'express';
import { getAllPermissions } from '../controllers/permission.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Only ADMIN can view all permissions
router.get('/', authorize('ADMIN'), getAllPermissions);

export default router;

