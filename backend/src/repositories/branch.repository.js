import { prisma } from '../config/database.js';

export const branchRepository = {
  findAll: async (filters = {}) => {
    const { search, isActive, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.branch.count({ where }),
    ]);

    return {
      branches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  findById: async (id) => {
    return prisma.branch.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  },

  findByCode: async (code) => {
    return prisma.branch.findUnique({
      where: { code },
    });
  },

  create: async (data) => {
    return prisma.branch.create({
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  },

  update: async (id, data) => {
    return prisma.branch.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  },

  delete: async (id) => {
    return prisma.branch.delete({
      where: { id },
    });
  },

  count: async (where = {}) => {
    return prisma.branch.count({ where });
  },
};

