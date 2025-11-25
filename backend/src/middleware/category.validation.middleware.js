import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Invalid parent category ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
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

export const validateUpdateCategory = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Invalid parent category ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
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

