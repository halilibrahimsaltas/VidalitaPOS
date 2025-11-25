import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validateCreateSale = [
  body('branchId')
    .notEmpty()
    .withMessage('Branch ID is required')
    .isUUID()
    .withMessage('Invalid branch ID'),
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
  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('items.*.discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['CASH', 'CARD', 'CREDIT', 'MIXED'])
    .withMessage('Invalid payment method'),
  body('paidAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Paid amount must be a non-negative number'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number'),
  body('customerId')
    .optional()
    .isUUID()
    .withMessage('Invalid customer ID'),
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

export const validateRefundSale = [
  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array'),
  body('items.*.itemId')
    .optional()
    .isUUID()
    .withMessage('Invalid item ID'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }
    next();
  },
];

