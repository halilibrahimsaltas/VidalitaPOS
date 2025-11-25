import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validateCreateOrUpdateInventory = [
  body('branchId')
    .notEmpty()
    .withMessage('Branch ID is required')
    .isUUID()
    .withMessage('Invalid branch ID'),
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Invalid product ID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Min stock level must be a non-negative integer'),
  body('maxStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max stock level must be a non-negative integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }
    next();
  },
];

export const validateCreateStockTransfer = [
  body('fromBranchId')
    .notEmpty()
    .withMessage('Source branch ID is required')
    .isUUID()
    .withMessage('Invalid source branch ID'),
  body('toBranchId')
    .notEmpty()
    .withMessage('Destination branch ID is required')
    .isUUID()
    .withMessage('Invalid destination branch ID'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }
    next();
  },
];

export const validateCreateStockAdjustment = [
  body('branchId')
    .notEmpty()
    .withMessage('Branch ID is required')
    .isUUID()
    .withMessage('Invalid branch ID'),
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Invalid product ID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity adjustment is required')
    .isInt()
    .withMessage('Quantity must be an integer'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason must not exceed 200 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }
    next();
  },
];

