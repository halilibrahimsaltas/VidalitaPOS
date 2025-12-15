import { prisma } from '../config/database.js';

export const userRepository = {
  findAll: async (filters = {}) => {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      branchId,
      search,
    } = filters;

    const skip = (page - 1) * limit;
    const where = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    if (branchId) {
      where.branchId = branchId;
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  },

  findByUsername: async (username) => {
    return prisma.user.findUnique({
      where: { username },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  },

  findByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  create: async (data) => {
    return prisma.user.create({
      data,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  },

  update: async (id, data) => {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  },

  delete: async (id) => {
    return prisma.user.delete({
      where: { id },
    });
  },

  updatePassword: async (id, hashedPassword) => {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  },
};

