
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { config } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { permissionRepository } from '../repositories/permission.repository.js';

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiration,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiration,
  });

  return { accessToken, refreshToken };
};

export const register = async (userData) => {
  const { username, email, password, fullName } = userData;

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
    },
  });

  if (existingUser) {
    throw new ApiError(400, 'Username or email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'USER', // Default role
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

export const login = async (username, password) => {
  // Hardcoded admin login (temporary - until database is ready)
  // This allows login without database connection for initial setup
  if (username === 'admin' && password === 'admin123') {
    console.log('🔐 Using hardcoded admin login (database may not be ready)');
    
    const hardcodedAdmin = {
      id: 'hardcoded-admin-id',
      username: 'admin',
      email: 'admin@vidalita.com',
      fullName: 'System Administrator',
      role: 'ADMIN',
      branch: null,
    };

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(hardcodedAdmin);

    // Get all permissions for admin (try to fetch from DB, but fallback to hardcoded list if DB is down)
    let permissions = [];
    try {
      const allPerms = await prisma.permission.findMany({
        select: { code: true },
      });
      permissions = allPerms.map(p => p.code);
    } catch (permError) {
      console.warn('⚠️ Could not fetch permissions from DB, using hardcoded permission list for admin');
      // Hardcoded admin permissions (all permissions - fallback if DB is not ready)
      permissions = [
        'users.view', 'users.create', 'users.update', 'users.delete', 'users.manage_permissions',
        'branches.view', 'branches.create', 'branches.update', 'branches.delete',
        'products.view', 'products.create', 'products.update', 'products.delete',
        'categories.view', 'categories.create', 'categories.update', 'categories.delete',
        'inventory.view', 'inventory.update', 'inventory.transfer', 'inventory.adjust',
        'sales.view', 'sales.create', 'sales.update', 'sales.delete', 'sales.refund',
        'customers.view', 'customers.create', 'customers.update', 'customers.delete',
        'reports.view', 'reports.export',
        'cash_register.view', 'cash_register.manage',
      ];
    }

    return {
      user: {
        ...hardcodedAdmin,
        permissions: permissions || [],
      },
      accessToken,
      refreshToken,
    };
  }

  // Normal login flow (requires database)
  // Find user
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token (optional: store in database for token revocation)
  // For now, we'll just return it

  // Get user with branch info
  const userWithBranch = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  // Get user permissions (for non-admin users)
  let permissions = [];
  if (user.role !== 'ADMIN') {
    try {
      permissions = await permissionRepository.getUserPermissionCodes(user.id);
      // Ensure permissions is always an array
      if (!Array.isArray(permissions)) {
        console.warn(`⚠️ User ${user.username} (${user.id}) has invalid permissions format. Resetting to empty array.`);
        permissions = [];
      }
      
      // Log if user has no permissions (should not happen for properly created users)
      if (permissions.length === 0) {
        console.warn(`⚠️ User ${user.username} (${user.id}) has no permissions assigned. Please assign permissions.`);
      }
    } catch (permError) {
      console.error(`❌ Error fetching permissions for user ${user.username}:`, permError);
      permissions = [];
    }
  } else {
    // Admin has all permissions - get all permission codes
    try {
      const allPerms = await prisma.permission.findMany({
        select: { code: true },
      });
      permissions = allPerms.map(p => p.code);
    } catch (permError) {
      console.error('❌ Error fetching all permissions for admin:', permError);
      permissions = [];
    }
  }

  return {
    user: {
      ...userWithBranch,
      permissions: permissions || [], // Ensure it's always an array
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    const { accessToken } = generateTokens(user);

    return { accessToken };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, 'Invalid refresh token');
    }
    throw error;
  }
};

