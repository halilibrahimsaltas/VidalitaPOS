import { prisma } from '../config/database.js';

export const productRepository = {
  findAll: async (filters = {}) => {
    const { search, categoryId, isActive, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          productPrices: {
            include: {
              priceList: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  isDefault: true,
                },
              },
            },
            orderBy: {
              priceList: {
                isDefault: 'desc',
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  findById: async (id) => {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        productPrices: {
          include: {
            priceList: {
              select: {
                id: true,
                name: true,
                code: true,
                isDefault: true,
              },
            },
          },
          orderBy: {
            priceList: {
              isDefault: 'desc',
            },
          },
        },
      },
    });
  },

  findByBarcode: async (barcode, priceListId = null) => {
    const product = await prisma.product.findUnique({
      where: { barcode },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        productPrices: {
          include: {
            priceList: {
              select: {
                id: true,
                name: true,
                code: true,
                isDefault: true,
              },
            },
          },
          orderBy: {
            priceList: {
              isDefault: 'desc',
            },
          },
        },
      },
    });

    // If priceListId is provided, add the price for that list
    if (product && priceListId) {
      const priceForList = product.productPrices.find(pp => pp.priceListId === priceListId);
      if (priceForList) {
        product.priceListPrice = priceForList.price;
      }
    }

    return product;
  },

  findBySku: async (sku) => {
    return prisma.product.findUnique({
      where: { sku },
    });
  },

  create: async (data) => {
    return prisma.product.create({
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  },

  update: async (id, data) => {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  },

  delete: async (id) => {
    return prisma.product.delete({
      where: { id },
    });
  },
};

