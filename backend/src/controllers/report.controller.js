import { ApiResponse } from '../utils/ApiResponse.js';
import * as reportService from '../services/report.service.js';

export const getSalesSummary = async (req, res, next) => {
  try {
    const filters = {
      branchId: req.query.branchId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const result = await reportService.getSalesSummary(filters);
    res.json(ApiResponse.success(result, 'Sales summary retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getInventoryStatus = async (req, res, next) => {
  try {
    const filters = {
      branchId: req.query.branchId,
    };

    const result = await reportService.getInventoryStatus(filters);
    res.json(ApiResponse.success(result, 'Inventory status retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (req, res, next) => {
  try {
    const filters = {
      branchId: req.query.branchId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit || 10,
    };

    const result = await reportService.getTopProducts(filters);
    res.json(ApiResponse.success(result, 'Top products retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getDebtSummary = async (req, res, next) => {
  try {
    const filters = {
      branchId: req.query.branchId,
    };

    const result = await reportService.getDebtSummary(filters);
    res.json(ApiResponse.success(result, 'Debt summary retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getDashboardOverview = async (req, res, next) => {
  try {
    const filters = {
      branchId: req.query.branchId,
    };

    const result = await reportService.getDashboardOverview(filters);
    res.json(ApiResponse.success(result, 'Dashboard overview retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

