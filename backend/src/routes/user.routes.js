import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUpdateUserRole,
} from '../middleware/user.validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Only ADMIN can manage users
router.get('/', authorize('ADMIN', 'MANAGER'), getAllUsers);
router.get('/:id', authorize('ADMIN', 'MANAGER'), getUserById);
router.post('/', authorize('ADMIN'), validateCreateUser, createUser);
router.put('/:id', authorize('ADMIN'), validateUpdateUser, updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);
router.patch('/:id/role', authorize('ADMIN'), validateUpdateUserRole, updateUserRole);

export default router;

