import { ApiResponse } from '../utils/ApiResponse.js';
import * as customerService from '../services/customer.service.js';

export const getAllCustomers = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      isActive: req.query.isActive,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await customerService.getAllCustomers(filters);
    res.json(ApiResponse.success(result, 'Customers retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);
    res.json(ApiResponse.success(customer, 'Customer retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(ApiResponse.success(customer, 'Customer created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await customerService.updateCustomer(id, req.body);
    res.json(ApiResponse.success(customer, 'Customer updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    await customerService.deleteCustomer(id);
    res.json(ApiResponse.success(null, 'Customer deleted successfully'));
  } catch (error) {
    next(error);
  }
};

