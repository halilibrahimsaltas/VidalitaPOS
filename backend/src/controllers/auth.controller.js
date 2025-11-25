import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as authService from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(ApiResponse.success(user, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(ApiResponse.success(result, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    const result = await authService.refreshAccessToken(refreshToken);
    res.json(ApiResponse.success(result, 'Token refreshed successfully'));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // In a more advanced implementation, you would invalidate the refresh token
    // For now, we'll just return success
    res.json(ApiResponse.success(null, 'Logout successful'));
  } catch (error) {
    next(error);
  }
};

