import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';
import permissionService from './permission.service.js';

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

    // Assign default permissions based on role (except ADMIN)
    const userRole = role || 'USER';
    if (userRole !== 'ADMIN') {
      try {
        // Get all permissions
        const allPermissions = await prisma.permission.findMany();
        
        if (!allPermissions || allPermissions.length === 0) {
          console.warn('⚠️ No permissions found in database. Please run: npx prisma db seed');
          // Don't fail user creation, but log warning
        } else {
          const permissionsByCode = {};
          allPermissions.forEach(perm => {
            permissionsByCode[perm.code] = perm;
          });

          // Define role-based default permissions (same as seed.js)
          const allPermissionCodes = allPermissions.map(p => p.code);
          const userBranchPermissions = [
            'users.view', 'users.create', 'users.update', 'users.delete', 'users.manage_permissions',
            'branches.view', 'branches.create', 'branches.update', 'branches.delete',
          ];
          
          // Permissions for all non-admin roles (everything except user/branch management)
          const commonPermissions = allPermissionCodes.filter(code => !userBranchPermissions.includes(code));
          
          // Get permission IDs for the role
          const rolePermissionIds = commonPermissions
            .map(code => permissionsByCode[code]?.id)
            .filter(id => id !== undefined && id !== null);
          
          // First, ensure no existing permissions (clean slate)
          await prisma.userPermission.deleteMany({
            where: { userId: user.id },
          });
          
          // Assign permissions to user
          if (rolePermissionIds.length > 0) {
            await prisma.userPermission.createMany({
              data: rolePermissionIds.map(permissionId => ({
                userId: user.id,
                permissionId,
              })),
              skipDuplicates: true,
            });
            console.log(`✅ Assigned ${rolePermissionIds.length} default permissions to user ${user.username} (${userRole})`);
          } else {
            console.warn(`⚠️ No valid permissions found for role ${userRole}. User ${user.username} created without permissions.`);
          }
        }
      } catch (permError) {
        // Log error but don't fail user creation
        console.error('❌ Error assigning default permissions to user:', permError);
        console.error('User was created but may not have proper permissions. Please assign manually.');
      }
    }

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

  getUserPermissions: async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return permissionService.getUserPermissions(id);
  },

  updateUserPermissions: async (id, permissionIds) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return permissionService.assignPermissionsToUser(id, permissionIds);
  },
};

export default userService;

