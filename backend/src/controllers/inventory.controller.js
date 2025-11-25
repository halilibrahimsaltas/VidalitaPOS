import { ApiResponse } from '../utils/ApiResponse.js';
import * as inventoryService from '../services/inventory.service.js';

export const getAllInventory = async (req, res, next) => {
  try {
    const filters = {
      branchId: req.query.branchId,
      productId: req.query.productId,
      lowStock: req.query.lowStock,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await inventoryService.getAllInventory(filters);
    res.json(ApiResponse.success(result, 'Inventory retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getInventoryByBranch = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const inventory = await inventoryService.getInventoryByBranch(branchId);
    res.json(ApiResponse.success(inventory, 'Inventory retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getInventoryByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const inventory = await inventoryService.getInventoryByProduct(productId);
    res.json(ApiResponse.success(inventory, 'Inventory retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getInventoryItem = async (req, res, next) => {
  try {
    const { branchId, productId } = req.params;
    const inventory = await inventoryService.getInventoryItem(branchId, productId);
    res.json(ApiResponse.success(inventory, 'Inventory item retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.createOrUpdateInventory(req.body);
    res.json(ApiResponse.success(inventory, 'Inventory updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const getLowStockItems = async (req, res, next) => {
  try {
    const branchId = req.query.branchId || null;
    const items = await inventoryService.getLowStockItems(branchId);
    res.json(ApiResponse.success(items, 'Low stock items retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

