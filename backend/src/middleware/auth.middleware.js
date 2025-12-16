import jwt from 'jsonwebtoken';
import { config } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { permissionRepository } from '../repositories/permission.repository.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwt.secret);

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, 'Invalid token'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, 'Token expired'));
    }
    // If it's already an ApiError, pass it along
    if (error instanceof ApiError) {
      return next(error);
    }
    // Otherwise, create a new ApiError
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Middleware to check if user has a specific permission
 * Admin users automatically have all permissions
 */
export const hasPermission = (...permissionCodes) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, 'Authentication required'));
      }

      // Admin always has all permissions
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Check if user has at least one of the required permissions
      const userPermissions = await permissionRepository.getUserPermissionCodes(req.user.id);
      
      const hasAnyPermission = permissionCodes.some((code) => 
        userPermissions.includes(code)
      );

      if (!hasAnyPermission) {
        return next(new ApiError(403, 'Insufficient permissions'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

