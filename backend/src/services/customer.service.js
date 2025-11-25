import { customerRepository } from '../repositories/customer.repository.js';
import { ApiError } from '../utils/ApiError.js';

export const customerService = {
  getAllCustomers: async (filters) => {
    return customerRepository.findAll(filters);
  },

  getCustomerById: async (id) => {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }
    return customer;
  },

  createCustomer: async (customerData) => {
    return customerRepository.create(customerData);
  },

  updateCustomer: async (id, customerData) => {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    return customerRepository.update(id, customerData);
  },

  deleteCustomer: async (id) => {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    // Check if customer has sales
    if (customer._count?.sales > 0) {
      throw new ApiError(400, 'Cannot delete customer with associated sales');
    }

    return customerRepository.delete(id);
  },
};

