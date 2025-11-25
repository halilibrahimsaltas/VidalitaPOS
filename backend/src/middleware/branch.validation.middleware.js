import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validateCreateBranch = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Branch name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Branch name must be between 2 and 100 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Branch code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Branch code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Branch code can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }
    next();
  },
];

export const validateUpdateBranch = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Branch name must be between 2 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Branch code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Branch code can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }
    next();
  },
];

