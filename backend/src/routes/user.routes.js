import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserPermissions,
  updateUserPermissions,
} from '../controllers/user.controller.js';
import { authenticate, authorize, hasPermission } from '../middleware/auth.middleware.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUpdateUserRole,
} from '../middleware/user.validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User management routes - ADMIN or users with appropriate permissions
router.get('/', 
  (req, res, next) => {
    if (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') {
      return next();
    }
    return hasPermission('users.view')(req, res, next);
  },
  getAllUsers
);
router.get('/:id', 
  (req, res, next) => {
    if (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') {
      return next();
    }
    return hasPermission('users.view')(req, res, next);
  },
  getUserById
);
router.post('/', 
  (req, res, next) => {
    if (req.user.role === 'ADMIN') {
      return next();
    }
    return hasPermission('users.create')(req, res, next);
  },
  validateCreateUser, 
  createUser
);
router.put('/:id', 
  (req, res, next) => {
    if (req.user.role === 'ADMIN') {
      return next();
    }
    return hasPermission('users.update')(req, res, next);
  },
  validateUpdateUser, 
  updateUser
);
router.delete('/:id', 
  (req, res, next) => {
    if (req.user.role === 'ADMIN') {
      return next();
    }
    return hasPermission('users.delete')(req, res, next);
  },
  deleteUser
);
router.patch('/:id/role', authorize('ADMIN'), validateUpdateUserRole, updateUserRole);

// Permission management routes (only ADMIN)
router.get('/:id/permissions', authorize('ADMIN'), getUserPermissions);
router.put('/:id/permissions', authorize('ADMIN'), updateUserPermissions);

export default router;

