import { prisma } from '../config/database.js';

export const priceListRepository = {
  findAll: async (filters = {}) => {
    const { includeInactive = false } = filters;
    const where = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    return prisma.priceList.findMany({
      where,
      include: {
        _count: {
          select: {
            productPrices: true,
            sales: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });
  },

  findById: async (id) => {
    return prisma.priceList.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productPrices: true,
            sales: true,
          },
        },
      },
    });
  },

  findByCode: async (code) => {
    return prisma.priceList.findUnique({
      where: { code },
    });
  },

  findDefault: async () => {
    return prisma.priceList.findFirst({
      where: {
        isDefault: true,
        isActive: true,
      },
    });
  },

  create: async (data) => {
    // Eğer isDefault true ise, diğer tüm price list'lerin isDefault'unu false yap
    if (data.isDefault) {
      await prisma.priceList.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.priceList.create({
      data,
      include: {
        _count: {
          select: {
            productPrices: true,
            sales: true,
          },
        },
      },
    });
  },

  update: async (id, data) => {
    // Eğer isDefault true yapılıyorsa, diğer tüm price list'lerin isDefault'unu false yap
    if (data.isDefault) {
      await prisma.priceList.updateMany({
        where: {
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    return prisma.priceList.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            productPrices: true,
            sales: true,
          },
        },
      },
    });
  },

  delete: async (id) => {
    // ProductPrice'ları da sil (cascade)
    await prisma.productPrice.deleteMany({
      where: { priceListId: id },
    });

    return prisma.priceList.delete({
      where: { id },
    });
  },
};

export const productPriceRepository = {
  findByProduct: async (productId) => {
    return prisma.productPrice.findMany({
      where: { productId },
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
    });
  },

  findByPriceList: async (priceListId) => {
    return prisma.productPrice.findMany({
      where: { priceListId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            barcode: true,
            sku: true,
            currency: true,
          },
        },
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });
  },

  findByProductAndPriceList: async (productId, priceListId) => {
    return prisma.productPrice.findUnique({
      where: {
        productId_priceListId: {
          productId,
          priceListId,
        },
      },
    });
  },

  create: async (data) => {
    return prisma.productPrice.create({
      data,
      include: {
        priceList: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            barcode: true,
            sku: true,
            currency: true,
          },
        },
      },
    });
  },

  update: async (productId, priceListId, data) => {
    return prisma.productPrice.update({
      where: {
        productId_priceListId: {
          productId,
          priceListId,
        },
      },
      data,
      include: {
        priceList: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            barcode: true,
            sku: true,
            currency: true,
          },
        },
      },
    });
  },

  upsert: async (productId, priceListId, price) => {
    return prisma.productPrice.upsert({
      where: {
        productId_priceListId: {
          productId,
          priceListId,
        },
      },
      create: {
        productId,
        priceListId,
        price,
      },
      update: {
        price,
      },
      include: {
        priceList: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            barcode: true,
            sku: true,
            currency: true,
          },
        },
      },
    });
  },

  delete: async (productId, priceListId) => {
    return prisma.productPrice.delete({
      where: {
        productId_priceListId: {
          productId,
          priceListId,
        },
      },
    });
  },

  deleteByProduct: async (productId) => {
    return prisma.productPrice.deleteMany({
      where: { productId },
    });
  },
};

