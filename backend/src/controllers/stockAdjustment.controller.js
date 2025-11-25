import { ApiResponse } from '../utils/ApiResponse.js';
import * as stockAdjustmentService from '../services/stockAdjustment.service.js';

export const getAllAdjustments = async (req, res, next) => {
  try {
    const filters = {
      branchId: req.query.branchId,
      productId: req.query.productId,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await stockAdjustmentService.getAllAdjustments(filters);
    res.json(ApiResponse.success(result, 'Stock adjustments retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAdjustmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adjustment = await stockAdjustmentService.getAdjustmentById(id);
    res.json(ApiResponse.success(adjustment, 'Stock adjustment retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createAdjustment = async (req, res, next) => {
  try {
    const adjustment = await stockAdjustmentService.createAdjustment(req.body, req.user.id);
    res.status(201).json(ApiResponse.success(adjustment, 'Stock adjustment created successfully'));
  } catch (error) {
    next(error);
  }
};

