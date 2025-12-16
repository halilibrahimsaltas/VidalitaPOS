import { prisma } from '../config/database.js';

export const permissionRepository = {
  findAll: async () => {
    return prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { action: 'asc' },
      ],
    });
  },

  findById: async (id) => {
    return prisma.permission.findUnique({
      where: { id },
    });
  },

  findByCode: async (code) => {
    return prisma.permission.findUnique({
      where: { code },
    });
  },

  create: async (data) => {
    return prisma.permission.create({
      data,
    });
  },

  update: async (id, data) => {
    return prisma.permission.update({
      where: { id },
      data,
    });
  },

  delete: async (id) => {
    return prisma.permission.delete({
      where: { id },
    });
  },

  // Get permissions for a user
  getUserPermissions: async (userId) => {
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: true,
      },
    });
    return userPermissions.map((up) => up.permission);
  },

  // Get permission codes for a user (for quick checking)
  getUserPermissionCodes: async (userId) => {
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: true,
      },
    });
    return userPermissions.map((up) => up.permission.code);
  },

  // Assign permissions to user
  assignPermissions: async (userId, permissionIds) => {
    // First, remove all existing permissions
    await prisma.userPermission.deleteMany({
      where: { userId },
    });

    // Then, add new permissions
    if (permissionIds && permissionIds.length > 0) {
      await prisma.userPermission.createMany({
        data: permissionIds.map((permissionId) => ({
          userId,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }

    // Return updated permissions
    return permissionRepository.getUserPermissions(userId);
  },

  // Check if user has a specific permission
  hasPermission: async (userId, permissionCode) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Admin always has all permissions
    if (user.role === 'ADMIN') {
      return true;
    }

    // Check if user has the specific permission
    return user.permissions.some(
      (up) => up.permission.code === permissionCode
    );
  },
};

