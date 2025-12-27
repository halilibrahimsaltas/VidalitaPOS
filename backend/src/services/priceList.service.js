import { priceListRepository, productPriceRepository } from '../repositories/priceList.repository.js';
import { ApiError } from '../utils/ApiError.js';

const priceListService = {
  getAllPriceLists: async (filters) => {
    return priceListRepository.findAll(filters);
  },

  getPriceListById: async (id) => {
    const priceList = await priceListRepository.findById(id);
    if (!priceList) {
      throw new ApiError(404, 'Price list not found');
    }
    return priceList;
  },

  getPriceListByCode: async (code) => {
    const priceList = await priceListRepository.findByCode(code);
    if (!priceList) {
      throw new ApiError(404, 'Price list not found');
    }
    return priceList;
  },

  getDefaultPriceList: async () => {
    const priceList = await priceListRepository.findDefault();
    if (!priceList) {
      throw new ApiError(404, 'No default price list found');
    }
    return priceList;
  },

  createPriceList: async (priceListData) => {
    const { code, name } = priceListData;

    // Check if code already exists
    const existingCode = await priceListRepository.findByCode(code);
    if (existingCode) {
      throw new ApiError(400, `Price list with code "${code}" already exists`);
    }

    return priceListRepository.create(priceListData);
  },

  updatePriceList: async (id, priceListData) => {
    const priceList = await priceListRepository.findById(id);
    if (!priceList) {
      throw new ApiError(404, 'Price list not found');
    }

    // If code is being changed, check if new code already exists
    if (priceListData.code && priceListData.code !== priceList.code) {
      const existingCode = await priceListRepository.findByCode(priceListData.code);
      if (existingCode) {
        throw new ApiError(400, `Price list with code "${priceListData.code}" already exists`);
      }
    }

    return priceListRepository.update(id, priceListData);
  },

  deletePriceList: async (id) => {
    const priceList = await priceListRepository.findById(id);
    if (!priceList) {
      throw new ApiError(404, 'Price list not found');
    }

    // Check if price list is used in any sales
    if (priceList._count?.sales > 0) {
      throw new ApiError(400, 'Cannot delete price list that is used in sales');
    }

    return priceListRepository.delete(id);
  },

  // Product Price methods
  getProductPrices: async (productId) => {
    return productPriceRepository.findByProduct(productId);
  },

  getPriceListProducts: async (priceListId) => {
    return productPriceRepository.findByPriceList(priceListId);
  },

  setProductPrice: async (productId, priceListId, price) => {
    // Validate price
    if (price < 0) {
      throw new ApiError(400, 'Price cannot be negative');
    }

    return productPriceRepository.upsert(productId, priceListId, price);
  },

  updateProductPrice: async (productId, priceListId, price) => {
    // Validate price
    if (price < 0) {
      throw new ApiError(400, 'Price cannot be negative');
    }

    const productPrice = await productPriceRepository.findByProductAndPriceList(productId, priceListId);
    if (!productPrice) {
      throw new ApiError(404, 'Product price not found');
    }

    return productPriceRepository.update(productId, priceListId, { price });
  },

  deleteProductPrice: async (productId, priceListId) => {
    const productPrice = await productPriceRepository.findByProductAndPriceList(productId, priceListId);
    if (!productPrice) {
      throw new ApiError(404, 'Product price not found');
    }

    return productPriceRepository.delete(productId, priceListId);
  },

  // Bulk operations
  setProductPrices: async (productId, prices) => {
    // prices should be an array of { priceListId, price }
    const results = [];
    for (const { priceListId, price } of prices) {
      if (price < 0) {
        throw new ApiError(400, 'Price cannot be negative');
      }
      const result = await productPriceRepository.upsert(productId, priceListId, price);
      results.push(result);
    }
    return results;
  },
};

export default priceListService;

