import { ApiResponse } from '../utils/ApiResponse.js';
import branchService from '../services/branch.service.js';

export const getAllBranches = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      isActive: req.query.isActive,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await branchService.getAllBranches(filters);
    res.json(ApiResponse.success(result, 'Branches retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getBranchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const branch = await branchService.getBranchById(id);
    res.json(ApiResponse.success(branch, 'Branch retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const branch = await branchService.createBranch(req.body, req.user.id);
    res.status(201).json(ApiResponse.success(branch, 'Branch created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const branch = await branchService.updateBranch(id, req.body);
    res.json(ApiResponse.success(branch, 'Branch updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    await branchService.deleteBranch(id);
    res.json(ApiResponse.success(null, 'Branch deleted successfully'));
  } catch (error) {
    next(error);
  }
};

