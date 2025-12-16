import { ApiResponse } from '../utils/ApiResponse.js';
import permissionService from '../services/permission.service.js';

export const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await permissionService.getAllPermissions();
    res.json(ApiResponse.success(permissions, 'Permissions retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

