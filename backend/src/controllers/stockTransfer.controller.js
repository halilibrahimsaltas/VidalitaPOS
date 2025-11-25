import { ApiResponse } from '../utils/ApiResponse.js';
import * as stockTransferService from '../services/stockTransfer.service.js';

export const getAllTransfers = async (req, res, next) => {
  try {
    const filters = {
      branchId: req.query.branchId,
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await stockTransferService.getAllTransfers(filters);
    res.json(ApiResponse.success(result, 'Stock transfers retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getTransferById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transfer = await stockTransferService.getTransferById(id);
    res.json(ApiResponse.success(transfer, 'Stock transfer retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createTransfer = async (req, res, next) => {
  try {
    const transfer = await stockTransferService.createTransfer(req.body, req.user.id);
    res.status(201).json(ApiResponse.success(transfer, 'Stock transfer created successfully'));
  } catch (error) {
    next(error);
  }
};

export const completeTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transfer = await stockTransferService.completeTransfer(id);
    res.json(ApiResponse.success(transfer, 'Stock transfer completed successfully'));
  } catch (error) {
    next(error);
  }
};

export const cancelTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transfer = await stockTransferService.cancelTransfer(id);
    res.json(ApiResponse.success(transfer, 'Stock transfer cancelled successfully'));
  } catch (error) {
    next(error);
  }
};

