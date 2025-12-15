import { ApiResponse } from '../utils/ApiResponse.js';
import categoryService from '../services/category.service.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const filters = {
      includeInactive: req.query.includeInactive === 'true',
    };
    const categories = await categoryService.getAllCategories(filters);
    res.json(ApiResponse.success(categories, 'Categories retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    res.json(ApiResponse.success(category, 'Category retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getRootCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getRootCategories();
    res.json(ApiResponse.success(categories, 'Root categories retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(ApiResponse.success(category, 'Category created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryService.updateCategory(id, req.body);
    res.json(ApiResponse.success(category, 'Category updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    res.json(ApiResponse.success(null, 'Category deleted successfully'));
  } catch (error) {
    next(error);
  }
};

