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

  for (const perm of defaultPermissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }
  console.log('✅ Default permissions created');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

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
  console.log('📝 Default credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

