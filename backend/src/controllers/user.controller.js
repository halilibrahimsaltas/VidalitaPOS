import { ApiResponse } from '../utils/ApiResponse.js';
import userService from '../services/user.service.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      role: req.query.role,
      isActive: req.query.isActive,
      branchId: req.query.branchId,
      search: req.query.search,
    };

    const result = await userService.getAllUsers(filters);
    res.json(ApiResponse.success(result, 'Users retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.json(ApiResponse.success(user, 'User retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(ApiResponse.success(user, 'User created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    res.json(ApiResponse.success(user, 'User updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    res.json(ApiResponse.success(result, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await userService.updateUserRole(id, role);
    res.json(ApiResponse.success(user, 'User role updated successfully'));
  } catch (error) {
    next(error);
  }
};

