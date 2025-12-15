import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';

const userService = {
  getAllUsers: async (filters) => {
    return userRepository.findAll(filters);
  },

  getUserById: async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  createUser: async (userData) => {
    const { username, email, password, fullName, role, isActive, branchId } = userData;

    // Check if username already exists
    const existingUserByUsername = await userRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new ApiError(400, 'Username already exists');
    }

    // Check if email already exists
    const existingUserByEmail = await userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new ApiError(400, 'Email already exists');
    }

    // Verify branch if provided
    if (branchId) {
      const branch = await prisma.branch.findUnique({ where: { id: branchId } });
      if (!branch) {
        throw new ApiError(404, 'Branch not found');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userRepository.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: role || 'USER',
      isActive: isActive !== undefined ? isActive : true,
      branchId: branchId || null,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  updateUser: async (id, userData) => {
    const { username, email, password, fullName, role, isActive, branchId } = userData;

    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new ApiError(404, 'User not found');
    }

    // Check if username is being changed and if it already exists
    if (username && username !== existingUser.username) {
      const userWithUsername = await userRepository.findByUsername(username);
      if (userWithUsername) {
        throw new ApiError(400, 'Username already exists');
      }
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const userWithEmail = await userRepository.findByEmail(email);
      if (userWithEmail) {
        throw new ApiError(400, 'Email already exists');
      }
    }

    // Verify branch if provided
    if (branchId !== undefined) {
      if (branchId) {
        const branch = await prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch) {
          throw new ApiError(404, 'Branch not found');
        }
      }
    }

    // Prepare update data
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (fullName) updateData.fullName = fullName;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (branchId !== undefined) updateData.branchId = branchId || null;

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await userRepository.updatePassword(id, hashedPassword);
    }

    // Update user
    const user = await userRepository.update(id, updateData);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  deleteUser: async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Prevent deletion of admin users (optional safety check)
    // You can remove this if you want to allow deletion of admins
    // if (user.role === 'ADMIN') {
    //   throw new ApiError(400, 'Cannot delete admin user');
    // }

    await userRepository.delete(id);
    return { message: 'User deleted successfully' };
  },

  updateUserRole: async (id, role) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const validRoles = ['ADMIN', 'MANAGER', 'USER', 'CASHIER'];
    if (!validRoles.includes(role)) {
      throw new ApiError(400, 'Invalid role');
    }

    const updatedUser = await userRepository.update(id, { role });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },
};

export default userService;

