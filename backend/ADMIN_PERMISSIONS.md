# Admin Yetkileri ve Modül Erişimleri

## 📋 Genel Bakış

Bu dokümanda, VidalitaPOS sisteminde **ADMIN** rolünün yetkileri ve hangi modüllerin sadece admin tarafından erişilebilir olması gerektiği açıklanmaktadır.

## 🔐 Admin Rolü Özellikleri

- **Admin her zaman tüm yetkilere sahiptir** (kod seviyesinde kontrol edilir)
- Admin için permission kontrolü yapılmaz, direkt erişim sağlanır
- Admin, diğer kullanıcılara yetki atayabilir

## 🎯 Sadece Admin'e Özel Modüller

### 1. **Kullanıcı Yönetimi (Users Management)** ✅
**Mevcut Durum:** Kısmen admin-only
**Önerilen:** Tamamen admin-only

**Admin Yetkileri:**
- ✅ Tüm kullanıcıları görüntüleme
- ✅ Yeni kullanıcı oluşturma
- ✅ Kullanıcı bilgilerini güncelleme
- ✅ Kullanıcı silme
- ✅ Kullanıcı rolü değiştirme (ADMIN, MANAGER, USER, CASHIER)
- ✅ Kullanıcı yetkilerini atama/değiştirme
- ✅ Kullanıcı durumunu aktif/pasif yapma

**Neden Admin-Only?**
- Güvenlik: Sistem yönetimi kritik
- Yetki kontrolü: Sadece admin kullanıcı oluşturabilmeli
- Rol yönetimi: Rol değişiklikleri sadece admin tarafından yapılmalı

### 2. **Şube Yönetimi (Branches Management)** ✅
**Mevcut Durum:** Kısmen admin-only (create/update/delete admin-only, view herkese açık)
**Önerilen:** Tamamen admin-only (view dahil)

**Admin Yetkileri:**
- ✅ Tüm şubeleri görüntüleme
- ✅ Yeni şube oluşturma
- ✅ Şube bilgilerini güncelleme
- ✅ Şube silme
- ✅ Şube aktif/pasif durumu yönetimi

**Neden Admin-Only?**
- Organizasyon yapısı: Şube yönetimi merkezi olmalı
- Veri bütünlüğü: Şube silme/değiştirme kritik işlemler
- Güvenlik: Şube bilgileri hassas veri

### 3. **Yetki Yönetimi (Permissions Management)** ✅
**Mevcut Durum:** Tamamen admin-only
**Önerilen:** Aynı şekilde kalmalı

**Admin Yetkileri:**
- ✅ Tüm yetkileri görüntüleme
- ✅ Yetki sistemini yönetme
- ✅ Kullanıcılara yetki atama

**Neden Admin-Only?**
- Sistem güvenliği: Yetki yönetimi en kritik modül
- Erişim kontrolü: Sadece admin yetki değişikliği yapabilmeli

## 🔓 Admin + Diğer Kullanıcılar (Permission-Based)

### 4. **Ürün Yönetimi (Products Management)**
**Admin Yetkileri:**
- ✅ Tüm ürünleri görüntüleme (tüm şubeler)
- ✅ Ürün oluşturma/düzenleme/silme
- ✅ Kategori yönetimi
- ✅ Fiyat yönetimi

**Diğer Kullanıcılar:**
- İlgili yetkiye sahipse (products.view, products.create, etc.) erişebilir
- Genelde sadece kendi şubelerindeki ürünleri görebilir

### 5. **Stok Yönetimi (Inventory Management)**
**Admin Yetkileri:**
- ✅ Tüm şubelerin stoklarını görüntüleme
- ✅ Stok transferi yönetimi
- ✅ Stok düzeltmeleri
- ✅ Stok seviyesi ayarları

**Diğer Kullanıcılar:**
- İlgili yetkiye sahipse erişebilir
- Genelde sadece kendi şubelerinin stoklarını görebilir

### 6. **Satış Yönetimi (Sales Management)**
**Admin Yetkileri:**
- ✅ Tüm şubelerin satışlarını görüntüleme
- ✅ Satış iptal/iade işlemleri
- ✅ Satış raporları

**Diğer Kullanıcılar:**
- POS kullanımı: `pos.use` yetkisi ile satış yapabilir
- Satış görüntüleme: `sales.view` yetkisi ile kendi satışlarını görebilir

### 7. **Müşteri Yönetimi (Customers Management)**
**Admin Yetkileri:**
- ✅ Tüm müşterileri görüntüleme
- ✅ Müşteri oluşturma/düzenleme/silme
- ✅ Müşteri borç yönetimi

**Diğer Kullanıcılar:**
- İlgili yetkiye sahipse erişebilir
- Genelde sadece kendi şubelerinin müşterilerini görebilir

### 8. **Raporlar (Reports)**
**Admin Yetkileri:**
- ✅ Tüm şubelerin raporlarını görüntüleme
- ✅ Günlük/Aylık kasa raporları
- ✅ Detaylı analiz raporları
- ✅ Finansal raporlar

**Diğer Kullanıcılar:**
- `reports.view` yetkisi ile sadece kendi şubelerinin raporlarını görebilir

## 📊 Önerilen Değişiklikler

### 1. Users Routes - Tamamen Admin-Only
```javascript
// ÖNERİ: Tüm user route'ları sadece admin için
router.get('/', authorize('ADMIN'), getAllUsers);
router.get('/:id', authorize('ADMIN'), getUserById);
router.post('/', authorize('ADMIN'), validateCreateUser, createUser);
router.put('/:id', authorize('ADMIN'), validateUpdateUser, updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);
router.patch('/:id/role', authorize('ADMIN'), validateUpdateUserRole, updateUserRole);
router.get('/:id/permissions', authorize('ADMIN'), getUserPermissions);
router.put('/:id/permissions', authorize('ADMIN'), updateUserPermissions);
```

### 2. Branches Routes - View de Admin-Only
```javascript
// ÖNERİ: View route'ları da admin-only yapılmalı
router.get('/', authorize('ADMIN'), getAllBranches);
router.get('/:id', authorize('ADMIN'), getBranchById);
router.post('/', authorize('ADMIN'), validateCreateBranch, createBranch);
router.put('/:id', authorize('ADMIN'), validateUpdateBranch, updateBranch);
router.delete('/:id', authorize('ADMIN'), deleteBranch);
```

### 3. Reports Routes - Admin Tüm Şubeleri Görebilmeli
```javascript
// ÖNERİ: Admin tüm şubelerin raporlarını görebilmeli
// Diğer kullanıcılar sadece kendi şubelerini görebilmeli
// Bu kontrol controller veya service seviyesinde yapılmalı
```

## 🎯 Özet Tablo

| Modül | Admin Erişimi | Diğer Kullanıcılar | Önerilen Değişiklik |
|-------|--------------|-------------------|-------------------|
| **Users** | ✅ Tam Erişim | ❌ Erişim Yok | Tamamen admin-only yap |
| **Branches** | ✅ Tam Erişim | ⚠️ Sadece View | View'ı da admin-only yap |
| **Permissions** | ✅ Tam Erişim | ❌ Erişim Yok | ✅ Zaten admin-only |
| **Products** | ✅ Tam Erişim | ✅ Permission-based | ✅ Mevcut durum uygun |
| **Inventory** | ✅ Tam Erişim | ✅ Permission-based | ✅ Mevcut durum uygun |
| **Sales** | ✅ Tam Erişim | ✅ Permission-based | ✅ Mevcut durum uygun |
| **Customers** | ✅ Tam Erişim | ✅ Permission-based | ✅ Mevcut durum uygun |
| **Reports** | ✅ Tüm Şubeler | ✅ Sadece Kendi Şubesi | ✅ Mevcut durum uygun |

## 🔒 Güvenlik Notları

1. **Admin rolü kontrolü her zaman yapılmalı:**
   ```javascript
   if (req.user.role === 'ADMIN') {
     // Admin her şeyi yapabilir
     return next();
   }
   ```

2. **Permission kontrolü admin için atlanmalı:**
   ```javascript
   // Admin için permission kontrolü yapma
   if (req.user.role !== 'ADMIN') {
     // Permission kontrolü yap
   }
   ```

3. **Şube bazlı filtreleme:**
   - Admin: Tüm şubeleri görebilir
   - Diğer kullanıcılar: Sadece kendi şubelerini görebilir

## 📝 Sonuç

**Sadece Admin'e Özel Modüller:**
1. ✅ **Users Management** - Tamamen admin-only
2. ✅ **Branches Management** - Tamamen admin-only (view dahil)
3. ✅ **Permissions Management** - Zaten admin-only

**Admin + Permission-Based Modüller:**
- Products, Inventory, Sales, Customers, Reports
- Admin tüm şubeleri görebilir, diğerleri sadece kendi şubelerini

Bu yapı, güvenli ve ölçeklenebilir bir POS sistemi sağlar.

