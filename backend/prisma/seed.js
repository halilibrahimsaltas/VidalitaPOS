import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default permissions
  console.log('📋 Creating default permissions...');
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
    { code: 'sales.create', name: 'Satış Yap', module: 'sales', action: 'create', description: 'Yeni satış yapma yetkisi (POS kullanımı)' },
    { code: 'sales.view_detail', name: 'Satış Detayı Görüntüle', module: 'sales', action: 'view_detail', description: 'Satış detaylarını görüntüleme yetkisi' },
    { code: 'sales.refund', name: 'İade Yap', module: 'sales', action: 'refund', description: 'Satış iadesi yapma yetkisi' },
    { code: 'sales.cancel', name: 'Satış İptal Et', module: 'sales', action: 'cancel', description: 'Satış iptal etme yetkisi' },
    { code: 'sales.view_invoice', name: 'Fatura Görüntüle', module: 'sales', action: 'view_invoice', description: 'Fatura görüntüleme ve yazdırma yetkisi' },
    
    // Customer management
    { code: 'customers.view', name: 'Müşterileri Görüntüle', module: 'customers', action: 'view', description: 'Müşteri listesini görüntüleme yetkisi' },
    { code: 'customers.create', name: 'Müşteri Oluştur', module: 'customers', action: 'create', description: 'Yeni müşteri oluşturma yetkisi' },
    { code: 'customers.update', name: 'Müşteri Güncelle', module: 'customers', action: 'update', description: 'Müşteri bilgilerini güncelleme yetkisi' },
    { code: 'customers.delete', name: 'Müşteri Sil', module: 'customers', action: 'delete', description: 'Müşteri silme yetkisi' },
    { code: 'customers.view_history', name: 'Müşteri Geçmişi Görüntüle', module: 'customers', action: 'view_history', description: 'Müşteri satın alma geçmişini görüntüleme yetkisi' },
    { code: 'customers.manage_payments', name: 'Müşteri Ödemelerini Yönet', module: 'customers', action: 'manage_payments', description: 'Müşteri ödemelerini kaydetme ve yönetme yetkisi' },
    { code: 'customers.view_statistics', name: 'Müşteri İstatistikleri Görüntüle', module: 'customers', action: 'view_statistics', description: 'Müşteri istatistiklerini görüntüleme yetkisi' },
    
    // Reports
    { code: 'reports.view', name: 'Raporları Görüntüle', module: 'reports', action: 'view', description: 'Raporları görüntüleme yetkisi' },
    { code: 'reports.cash_register', name: 'Kasa Raporu Görüntüle', module: 'reports', action: 'cash_register', description: 'Gün sonu ve ay sonu kasa raporlarını görüntüleme yetkisi' },
    { code: 'reports.sales', name: 'Satış Raporları Görüntüle', module: 'reports', action: 'sales', description: 'Satış raporlarını görüntüleme yetkisi' },
    { code: 'reports.export', name: 'Rapor Dışa Aktar', module: 'reports', action: 'export', description: 'Raporları dışa aktarma yetkisi' },
    
    // Dashboard
    { code: 'dashboard.view', name: 'Dashboard Görüntüle', module: 'dashboard', action: 'view', description: 'Dashboard görüntüleme yetkisi' },
    
    // POS (Point of Sale)
    { code: 'pos.use', name: 'POS Kullan', module: 'pos', action: 'use', description: 'POS ekranını kullanma yetkisi' },
    { code: 'pos.apply_discount', name: 'POS İndirim Uygula', module: 'pos', action: 'apply_discount', description: 'POS ekranında indirim uygulama yetkisi' },
  ];

  for (const perm of defaultPermissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }
  console.log('✅ Default permissions created');

  // Get all permissions for role-based assignment
  const allPermissions = await prisma.permission.findMany();
  const permissionsByCode = {};
  allPermissions.forEach(perm => {
    permissionsByCode[perm.code] = perm;
  });

  // Define role-based default permissions
  // All roles get all permissions EXCEPT users.* and branches.* (only ADMIN gets those)
  const allPermissionCodes = allPermissions.map(p => p.code);
  const userBranchPermissions = [
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'users.manage_permissions',
    'branches.view',
    'branches.create',
    'branches.update',
    'branches.delete',
  ];
  
  // Permissions for all non-admin roles (everything except user/branch management)
  const commonPermissions = allPermissionCodes.filter(code => !userBranchPermissions.includes(code));

  const rolePermissions = {
    CASHIER: commonPermissions,
    USER: commonPermissions,
    MANAGER: commonPermissions,
    // ADMIN has all permissions automatically (handled in middleware)
  };

  console.log('📋 Assigning default permissions to roles...');

  // Create default users with role-based permissions
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Admin user (no permissions needed - has all by default)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@vidalita.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Created admin user:', admin.username);

  // Create Manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      email: 'manager@vidalita.com',
      password: managerPassword,
      fullName: 'Store Manager',
      role: 'MANAGER',
      isActive: true,
    },
  });
  
  // Assign permissions to manager
  if (rolePermissions.MANAGER && rolePermissions.MANAGER.length > 0) {
    const managerPermissionIds = rolePermissions.MANAGER
      .map(code => permissionsByCode[code]?.id)
      .filter(id => id !== undefined && id !== null);
    
    if (managerPermissionIds.length > 0) {
      await prisma.userPermission.deleteMany({
        where: { userId: manager.id },
      });
      await prisma.userPermission.createMany({
        data: managerPermissionIds.map(permissionId => ({
          userId: manager.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
      console.log(`✅ Assigned ${managerPermissionIds.length} permissions to manager`);
    } else {
      console.warn('⚠️ No valid permissions found for manager role');
    }
  }
  console.log('✅ Created manager user:', manager.username);

  // Create Cashier user
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const cashier = await prisma.user.upsert({
    where: { username: 'cashier' },
    update: {},
    create: {
      username: 'cashier',
      email: 'cashier@vidalita.com',
      password: cashierPassword,
      fullName: 'Cashier User',
      role: 'CASHIER',
      isActive: true,
    },
  });
  
  // Assign permissions to cashier
  if (rolePermissions.CASHIER && rolePermissions.CASHIER.length > 0) {
    const cashierPermissionIds = rolePermissions.CASHIER
      .map(code => permissionsByCode[code]?.id)
      .filter(id => id !== undefined && id !== null);
    
    if (cashierPermissionIds.length > 0) {
      await prisma.userPermission.deleteMany({
        where: { userId: cashier.id },
      });
      await prisma.userPermission.createMany({
        data: cashierPermissionIds.map(permissionId => ({
          userId: cashier.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
      console.log(`✅ Assigned ${cashierPermissionIds.length} permissions to cashier`);
    } else {
      console.warn('⚠️ No valid permissions found for cashier role');
    }
  }
  console.log('✅ Created cashier user:', cashier.username);

  // Create regular User
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: {
      username: 'user',
      email: 'user@vidalita.com',
      password: userPassword,
      fullName: 'Regular User',
      role: 'USER',
      isActive: true,
    },
  });
  
  // Assign permissions to user
  if (rolePermissions.USER && rolePermissions.USER.length > 0) {
    const userPermissionIds = rolePermissions.USER
      .map(code => permissionsByCode[code]?.id)
      .filter(id => id !== undefined && id !== null);
    
    if (userPermissionIds.length > 0) {
      await prisma.userPermission.deleteMany({
        where: { userId: user.id },
      });
      await prisma.userPermission.createMany({
        data: userPermissionIds.map(permissionId => ({
          userId: user.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
      console.log(`✅ Assigned ${userPermissionIds.length} permissions to user`);
    } else {
      console.warn('⚠️ No valid permissions found for user role');
    }
  }
  console.log('✅ Created user:', user.username);

  console.log('📝 Default credentials:');
  console.log('   Admin - Username: admin, Password: admin123');
  console.log('   Manager - Username: manager, Password: manager123');
  console.log('   Cashier - Username: cashier, Password: cashier123');
  console.log('   User - Username: user, Password: user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

