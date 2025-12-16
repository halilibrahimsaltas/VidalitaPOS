import { permissionRepository } from '../repositories/permission.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';

const permissionService = {
  getAllPermissions: async () => {
    return permissionRepository.findAll();
  },

  getPermissionById: async (id) => {
    const permission = await permissionRepository.findById(id);
    if (!permission) {
      throw new ApiError(404, 'Permission not found');
    }
    return permission;
  },

  getUserPermissions: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return permissionRepository.getUserPermissions(userId);
  },

  getUserPermissionCodes: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return permissionRepository.getUserPermissionCodes(userId);
  },

  assignPermissionsToUser: async (userId, permissionIds) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Validate permission IDs
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          id: {
            in: permissionIds,
          },
        },
      });

      if (permissions.length !== permissionIds.length) {
        throw new ApiError(400, 'One or more permission IDs are invalid');
      }
    }

    return permissionRepository.assignPermissions(userId, permissionIds);
  },

  hasPermission: async (userId, permissionCode) => {
    return permissionRepository.hasPermission(userId, permissionCode);
  },

  // Initialize default permissions (for seeding)
  initializeDefaultPermissions: async () => {
    const defaultPermissions = [
      // User management
      { code: 'users.view', name: 'Kullanıcıları Görüntüle', module: 'users', action: 'view', description: 'Kullanıcı listesini görüntüleme yetkisi' },
      { code: 'users.create', name: 'Kullanıcı Oluştur', module: 'users', action: 'create', description: 'Yeni kullanıcı oluşturma yetkisi' },
      { code: 'users.update', name: 'Kullanıcı Güncelle', module: 'users', action: 'update', description: 'Kullanıcı bilgilerini güncelleme yetkisi' },
      { code: 'users.delete', name: 'Kullanıcı Sil', module: 'users', action: 'delete', description: 'Kullanıcı silme yetkisi' },
      { code: 'users.manage_permissions', name: 'Kullanıcı Yetkilerini Yönet', module: 'users', action: 'manage_permissions', description: 'Kullanıcı yetkilerini yönetme yetkisi' },
      
      // Branch management
      { code: 'branches.view', name: 'Şubeleri Görüntüle', module: 'branches', action: 'view', description: 'Şube listesini görüntüleme yetkisi' },
      { code: 'branches.create', name: 'Şube Oluştur', module: 'branches', action: 'create', description: 'Yeni şube oluşturma yetkisi' },
      { code: 'branches.update', name: 'Şube Güncelle', module: 'branches', action: 'update', description: 'Şube bilgilerini güncelleme yetkisi' },
      { code: 'branches.delete', name: 'Şube Sil', module: 'branches', action: 'delete', description: 'Şube silme yetkisi' },
      
      // Product management
      { code: 'products.view', name: 'Ürünleri Görüntüle', module: 'products', action: 'view', description: 'Ürün listesini görüntüleme yetkisi' },
      { code: 'products.create', name: 'Ürün Oluştur', module: 'products', action: 'create', description: 'Yeni ürün oluşturma yetkisi' },
      { code: 'products.update', name: 'Ürün Güncelle', module: 'products', action: 'update', description: 'Ürün bilgilerini güncelleme yetkisi' },
      { code: 'products.delete', name: 'Ürün Sil', module: 'products', action: 'delete', description: 'Ürün silme yetkisi' },
      
      // Inventory management
      { code: 'inventory.view', name: 'Stokları Görüntüle', module: 'inventory', action: 'view', description: 'Stok listesini görüntüleme yetkisi' },
      { code: 'inventory.update', name: 'Stok Güncelle', module: 'inventory', action: 'update', description: 'Stok miktarını güncelleme yetkisi' },
      { code: 'inventory.transfer', name: 'Stok Transferi', module: 'inventory', action: 'transfer', description: 'Stok transferi yapma yetkisi' },
      { code: 'inventory.adjust', name: 'Stok Düzeltme', module: 'inventory', action: 'adjust', description: 'Stok düzeltme yapma yetkisi' },
      
      // Sales management
      { code: 'sales.view', name: 'Satışları Görüntüle', module: 'sales', action: 'view', description: 'Satış listesini görüntüleme yetkisi' },
      { code: 'sales.create', name: 'Satış Yap', module: 'sales', action: 'create', description: 'Yeni satış yapma yetkisi' },
      { code: 'sales.refund', name: 'İade Yap', module: 'sales', action: 'refund', description: 'Satış iadesi yapma yetkisi' },
      
      // Customer management
      { code: 'customers.view', name: 'Müşterileri Görüntüle', module: 'customers', action: 'view', description: 'Müşteri listesini görüntüleme yetkisi' },
      { code: 'customers.create', name: 'Müşteri Oluştur', module: 'customers', action: 'create', description: 'Yeni müşteri oluşturma yetkisi' },
      { code: 'customers.update', name: 'Müşteri Güncelle', module: 'customers', action: 'update', description: 'Müşteri bilgilerini güncelleme yetkisi' },
      { code: 'customers.delete', name: 'Müşteri Sil', module: 'customers', action: 'delete', description: 'Müşteri silme yetkisi' },
      
      // Reports
      { code: 'reports.view', name: 'Raporları Görüntüle', module: 'reports', action: 'view', description: 'Raporları görüntüleme yetkisi' },
      
      // Dashboard
      { code: 'dashboard.view', name: 'Dashboard Görüntüle', module: 'dashboard', action: 'view', description: 'Dashboard görüntüleme yetkisi' },
    ];

    const createdPermissions = [];
    for (const perm of defaultPermissions) {
      const existing = await permissionRepository.findByCode(perm.code);
      if (!existing) {
        const created = await permissionRepository.create(perm);
        createdPermissions.push(created);
      } else {
        createdPermissions.push(existing);
      }
    }

    return createdPermissions;
  },
};

export default permissionService;

