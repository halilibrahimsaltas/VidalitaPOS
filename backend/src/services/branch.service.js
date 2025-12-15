import { branchRepository } from '../repositories/branch.repository.js';
import { ApiError } from '../utils/ApiError.js';

const branchService = {
  getAllBranches: async (filters) => {
    return branchRepository.findAll(filters);
  },

  getBranchById: async (id) => {
    const branch = await branchRepository.findById(id);
    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }
    return branch;
  },

  createBranch: async (branchData, userId) => {
    const { code } = branchData;

    // Check if code already exists
    const existingBranch = await branchRepository.findByCode(code);
    if (existingBranch) {
      throw new ApiError(400, 'Branch code already exists');
    }

    return branchRepository.create({
      ...branchData,
      createdById: userId,
    });
  },

  updateBranch: async (id, branchData) => {
    const branch = await branchRepository.findById(id);
    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }

    // If code is being updated, check for duplicates
    if (branchData.code && branchData.code !== branch.code) {
      const existingBranch = await branchRepository.findByCode(branchData.code);
      if (existingBranch) {
        throw new ApiError(400, 'Branch code already exists');
      }
    }

    return branchRepository.update(id, branchData);
  },

  deleteBranch: async (id) => {
    const branch = await branchRepository.findById(id);
    if (!branch) {
      throw new ApiError(404, 'Branch not found');
    }

    // Check if branch has users
    const { prisma } = await import('../config/database.js');
    const userCount = await prisma.user.count({
      where: { branchId: id },
    });

    if (userCount > 0) {
      throw new ApiError(400, 'Cannot delete branch with associated users');
    }

    return branchRepository.delete(id);
  },
};

export default branchService;

