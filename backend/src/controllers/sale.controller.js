import { ApiResponse } from '../utils/ApiResponse.js';
import * as saleService from '../services/sale.service.js';
import { generateReceipt } from '../utils/receipt.js';

export const getAllSales = async (req, res, next) => {
  try {
    const filters = {
      branchId: req.query.branchId,
      customerId: req.query.customerId,
      cashierId: req.query.cashierId,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await saleService.getAllSales(filters);
    res.json(ApiResponse.success(result, 'Sales retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getSaleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sale = await saleService.getSaleById(id);
    res.json(ApiResponse.success(sale, 'Sale retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getSaleByNumber = async (req, res, next) => {
  try {
    const { saleNumber } = req.params;
    const sale = await saleService.getSaleByNumber(saleNumber);
    res.json(ApiResponse.success(sale, 'Sale retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createSale = async (req, res, next) => {
  try {
    // Normalize customerId - convert empty string to null
    if (req.body.customerId === '') {
      req.body.customerId = null;
    }
    const sale = await saleService.createSale(req.body, req.user.id);
    res.status(201).json(ApiResponse.success(sale, 'Sale created successfully'));
  } catch (error) {
    next(error);
  }
};

export const refundSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    const refundItems = req.body.items || null;
    const sale = await saleService.refundSale(id, refundItems);
    res.json(ApiResponse.success(sale, 'Sale refunded successfully'));
  } catch (error) {
    next(error);
  }
};

export const getReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sale = await saleService.getSaleById(id);
    const receipt = generateReceipt(sale);
    res.json(ApiResponse.success({ receipt, sale }, 'Receipt generated successfully'));
  } catch (error) {
    next(error);
  }
};

