import { ApiResponse } from '../utils/ApiResponse.js';
import priceListService from '../services/priceList.service.js';

export const getAllPriceLists = async (req, res, next) => {
  try {
    const filters = {
      includeInactive: req.query.includeInactive === 'true',
    };
    const priceLists = await priceListService.getAllPriceLists(filters);
    res.json(ApiResponse.success(priceLists, 'Price lists retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getPriceListById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const priceList = await priceListService.getPriceListById(id);
    res.json(ApiResponse.success(priceList, 'Price list retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getDefaultPriceList = async (req, res, next) => {
  try {
    const priceList = await priceListService.getDefaultPriceList();
    res.json(ApiResponse.success(priceList, 'Default price list retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createPriceList = async (req, res, next) => {
  try {
    const priceList = await priceListService.createPriceList(req.body);
    res.status(201).json(ApiResponse.success(priceList, 'Price list created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updatePriceList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const priceList = await priceListService.updatePriceList(id, req.body);
    res.json(ApiResponse.success(priceList, 'Price list updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deletePriceList = async (req, res, next) => {
  try {
    const { id } = req.params;
    await priceListService.deletePriceList(id);
    res.json(ApiResponse.success(null, 'Price list deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// Product Price endpoints
export const getProductPrices = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const prices = await priceListService.getProductPrices(productId);
    res.json(ApiResponse.success(prices, 'Product prices retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getPriceListProducts = async (req, res, next) => {
  try {
    const { priceListId } = req.params;
    const products = await priceListService.getPriceListProducts(priceListId);
    res.json(ApiResponse.success(products, 'Price list products retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const setProductPrice = async (req, res, next) => {
  try {
    const { productId, priceListId } = req.params;
    const { price } = req.body;
    const productPrice = await priceListService.setProductPrice(productId, priceListId, price);
    res.json(ApiResponse.success(productPrice, 'Product price set successfully'));
  } catch (error) {
    next(error);
  }
};

export const setProductPrices = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { prices } = req.body; // Array of { priceListId, price }
    const productPrices = await priceListService.setProductPrices(productId, prices);
    res.json(ApiResponse.success(productPrices, 'Product prices set successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProductPrice = async (req, res, next) => {
  try {
    const { productId, priceListId } = req.params;
    await priceListService.deleteProductPrice(productId, priceListId);
    res.json(ApiResponse.success(null, 'Product price deleted successfully'));
  } catch (error) {
    next(error);
  }
};

