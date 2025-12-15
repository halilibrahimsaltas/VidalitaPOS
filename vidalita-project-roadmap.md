# 🛍️ Vidalita Retail Manager - Tam Proje Yol Haritası

## 📋 İçindekiler
- [Proje Özeti](#proje-özeti)
- [Teknoloji Stack](#teknoloji-stack)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum Adımları](#kurulum-adımları)
- [Geliştirme Roadmap](#geliştirme-roadmap)
- [Tamamlanan Adımlar](#tamamlanan-adımlar)
- [Gelecek Adımlar](#gelecek-adımlar)
- [API Endpoints Checklist](#api-endpoints-checklist)
- [Veritabanı Schema](#veritabanı-schema)
- [Testing Strategy](#testing-strategy)
- [Deployment Guide](#deployment-guide)

---

## 🎯 Proje Özeti

**Vidalita Retail Manager** - Çok şubeli perakende satış yönetimi için monolit web uygulaması

### Ana Özellikler
- ✅ Çok şubeli stok takibi
- ✅ Barkod destekli POS sistemi
- ✅ Personel yönetimi ve yetkilendirme
- ✅ Cari hesap (veresiye) yönetimi
- ✅ Detaylı raporlama ve dashboard
- ✅ Bulut yedekleme
- ✅ Fiş yazdırma (ESC/POS)
- ✅ 4 dil desteği (TR, EN, RU, UZ)


---

## 🛠️ Teknoloji Stack

### Backend
- **Runtime**: Node.js v20 LTS
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL 15+
- **Authentication**: JWT (access + refresh tokens)
- **File Upload**: Multer + AWS S3

### Frontend
- **Framework**: React 18+
- **Routing**: React Router DOM v6
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **i18n**: react-i18next
- **Charts**: Recharts
- **HTTP Client**: Axios

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK Stack
- **Cloud Storage**: AWS S3 / DigitalOcean Spaces
- **Reverse Proxy**: Nginx

---

## 📁 Proje Yapısı

```
vidalita-retail-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── s3.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── branch.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── inventory.controller.js
│   │   │   ├── sales.controller.js
│   │   │   ├── customer.controller.js
│   │   │   ├── report.controller.js
│   │   │   └── user.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── branch.service.js
│   │   │   ├── product.service.js
│   │   │   ├── inventory.service.js
│   │   │   ├── sales.service.js
│   │   │   ├── customer.service.js
│   │   │   └── report.service.js
│   │   ├── repositories/
│   │   │   ├── user.repository.js
│   │   │   ├── branch.repository.js
│   │   │   ├── product.repository.js
│   │   │   ├── inventory.repository.js
│   │   │   ├── sales.repository.js
│   │   │   └── customer.repository.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── rateLimit.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── branch.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── inventory.routes.js
│   │   │   ├── sales.routes.js
│   │   │   ├── customer.routes.js
│   │   │   ├── report.routes.js
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   └── helpers.js
│   │   ├── locales/
│   │   │   └── messages.js
│   │   ├── app.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── .env.example
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   └── Loader.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── auth/
│   │   │   │   └── LoginForm.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── SalesCard.jsx
│   │   │   │   ├── StockAlerts.jsx
│   │   │   │   └── RecentTransactions.jsx
│   │   │   ├── products/
│   │   │   │   ├── ProductList.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   └── ProductCard.jsx
│   │   │   ├── sales/
│   │   │   │   ├── POSScreen.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   └── PaymentModal.jsx
│   │   │   └── reports/
│   │   │       └── ReportViewer.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   ├── product.service.js
│   │   │   ├── sales.service.js
│   │   │   └── customer.service.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useProducts.js
│   │   │   ├── useSales.js
│   │   │   └── useDebounce.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── locales/
│   │   │   ├── tr.json
│   │   │   ├── en.json
│   │   │   ├── ru.json
│   │   │   └── uz.json
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── validators.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   ├── i18n.js
│   │   └── main.jsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── scripts/
│   ├── backup-db.sh
│   ├── restore-db.sh
│   └── seed-data.sh
├── docker-compose.yml
├── docker-compose.monitoring.yml
├── nginx.conf
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🚀 Kurulum Adımları

### Ön Gereksinimler
- Node.js v20+ LTS
- PostgreSQL 15+
- Docker & Docker Compose (production için)
- Git
- AWS Account (S3 için) veya DigitalOcean Spaces

### 1️⃣ Repository Klonlama
```bash
git clone https://github.com/your-org/vidalita-retail-manager.git
cd vidalita-retail-manager
```

### 2️⃣ Backend Kurulumu
```bash
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env

# .env dosyasını düzenle
nano .env
```

**`.env` Örnek:**
```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://vrm_user:password@localhost:5432/vidalita_retail"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# AWS S3
AWS_S3_BUCKET=vidalita-retail-storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Redis (optional)
REDIS_URL=redis://localhost:6379

# CORS
FRONTEND_URL=http://localhost:5173
```

```bash
# Prisma migrate
npx prisma migrate dev --name init

# Prisma generate
npx prisma generate

# Seed data (optional)
npm run seed

# Backend başlat
npm run dev
```

### 3️⃣ Frontend Kurulumu
```bash
cd ../frontend

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env

# .env dosyasını düzenle
nano .env
```

**`.env` Örnek:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Vidalita Retail Manager
```

```bash
# Frontend başlat
npm run dev
```

### 4️⃣ Tarayıcıda Aç
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

**Default Admin Hesabı:**
- Username: `admin`
- Password: `admin123` (ilk girişte değiştirin!)

---

## 📅 Geliştirme Roadmap

### ✅ FAZ 1: Temel Altyapı (Tamamlandı)
**Tahmini Süre**: 2 hafta
**Durum**: ✅ %100 Tamamlandı

- [x] Proje yapısı oluşturuldu
- [x] Docker & Docker Compose yapılandırması
- [x] PostgreSQL kurulumu
- [x] Prisma ORM entegrasyonu
- [x] Express.js backend başlangıç
- [x] React + Vite frontend başlangıç
- [x] Temel middleware'ler (auth, error handling)
- [x] JWT authentication sistemi
- [x] Veritabanı şeması tasarımı (ER diyagram)
- [x] API endpoint yapısı planlaması

### ✅ FAZ 2: Authentication & User Management (Tamamlandı)
**Tahmini Süre**: 1 hafta
**Durum**: ✅ %100 Tamamlandı

- [x] User model ve migration
- [x] Register endpoint
- [x] Login endpoint
- [x] JWT token generation & validation
- [x] Refresh token mekanizması
- [x] Password hashing (bcrypt)
- [x] Role-based access control (RBAC)
- [x] Login page UI
- [x] Protected route yapısı
- [x] Auth context & hooks

### ✅ FAZ 3: Branch Management (Tamamlandı)
**Tahmini Süre**: 1 hafta
**Durum**: ✅ %100 Tamamlandı

- [x] Branch model ve migration
- [x] CRUD API endpoints
- [x] Branch service layer
- [x] Branch list UI
- [x] Branch create/edit form
- [x] Branch selection component
- [x] Branch-based data filtering

### ✅ FAZ 4: Product Management (Tamamlandı)
**Tahmini Süre**: 2 hafta
**Durum**: ✅ %100 Tamamlandı

- [x] Product model ve migration
- [x] Category model ve migration (hiyerarşik)
- [x] Product CRUD API
- [x] Category CRUD API
- [x] Barcode generation/validation
- [x] Image upload (Local storage)
- [x] Product list UI (pagination, search, filter)
- [x] Product form (create/edit)
- [x] Barcode scanner integration (POS'ta kullanılıyor)
- [x] Bulk product import (CSV)
- [x] Product stock management (ürün oluşturma/güncelleme sırasında stok ekleme)
- [x] Barcode duplicate validation (aynı barkod ile ürün oluşturma engellendi)

### 🔄 FAZ 5: Inventory Management (Devam Ediyor)
**Tahmini Süre**: 2 hafta
**Durum**: 🔄 %85 Tamamlandı

- [x] Inventory model ve migration
- [x] Stock tracking API
- [x] Stock transfer API
- [x] Stock adjustment API
- [x] Low stock alerts
- [x] Inventory dashboard UI
- [x] Stock transfer form
- [x] Stock adjustment form
- [x] Inventory edit form
- [ ] Real-time stock updates (websocket - gelecekte)
- [ ] Stock transfer history list UI
- [ ] Stock adjustment history list UI

### 🔄 FAZ 6: POS & Sales (Devam Ediyor)
**Tahmini Süre**: 3 hafta
**Durum**: 🔄 %85 Tamamlandı (Backend %100, Frontend %70)

- [x] Sales model ve migration
- [x] Sale items model
- [x] Create sale API
- [x] Sale details API
- [x] Refund API
- [x] Receipt generation API
- [x] POS screen UI (barcode input, cart)
- [x] Payment modal (cash, card, credit)
- [x] Split payment (parçalı ödeme - multiple payment methods)
- [x] Manual product selection modal
- [x] Sale history list UI (filters, pagination, detail modal)
- [ ] ESC/POS printer integration

### ⏳ FAZ 7: Customer & Cari Management (Başlanacak)
**Tahmini Süre**: 2 hafta
**Durum**: ⏳ Bekliyor

- [ ] Customer model ve migration
- [ ] Customer transactions model
- [ ] Customer CRUD API
- [ ] Payment recording API
- [ ] Debt tracking
- [ ] Customer list UI
- [ ] Customer form
- [ ] Transaction history
- [ ] Payment recording form
- [ ] Debt reports

### 🔄 FAZ 8: Reporting & Analytics (Devam Ediyor)
**Tahmini Süre**: 2 hafta
**Durum**: 🔄 %75 Tamamlandı

- [x] Report API endpoints
- [x] Sales summary report
- [x] Inventory status report
- [x] Top products report
- [x] Debt summary report
- [x] Dashboard overview API
- [x] Cash register report (gün sonu kasa raporu)
- [x] Report viewer (filters, preview)
- [x] Print functionality
- [x] Dashboard UI (cards, charts, statistics)
- [ ] Excel export
- [ ] PDF export

### ⏳ FAZ 9: Localization (Başlanacak)
**Tahmini Süre**: 1 hafta
**Durum**: ⏳ Bekliyor

- [ ] i18next kurulumu
- [ ] TR lokalizasyon dosyası
- [ ] EN lokalizasyon dosyası
- [ ] RU lokalizasyon dosyası
- [ ] UZ lokalizasyon dosyası
- [ ] Language switcher component
- [ ] Backend error messages i18n
- [ ] Database content localization (categories)

### ⏳ FAZ 10: Testing (Başlanacak)
**Tahmini Süre**: 2 hafta
**Durum**: ⏳ Bekliyor

- [ ] Jest kurulumu
- [ ] Unit tests (services)
- [ ] Integration tests (API)
- [ ] React Testing Library
- [ ] Component tests
- [ ] E2E tests (Playwright)
- [ ] Test coverage %80+

### ⏳ FAZ 11: Deployment & DevOps (Başlanacak)
**Tahmini Süre**: 1 hafta
**Durum**: ⏳ Bekliyor

- [ ] Production Dockerfile'lar
- [ ] Docker Compose production
- [ ] Nginx configuration
- [ ] SSL certificate setup
- [ ] GitHub Actions CI/CD
- [ ] Automated backups
- [ ] Monitoring setup (Prometheus + Grafana)
- [ ] Log aggregation (ELK)

---

## 📝 Tamamlanan Adımlar

### Sprint 1 (Hafta 1-2) ✅
- ✅ Proje planlaması ve teknik doküman hazırlandı
- ✅ Repository oluşturuldu ve proje yapısı kuruldu
- ✅ Docker & Docker Compose yapılandırması tamamlandı
- ✅ PostgreSQL ve Redis container'ları ayağa kaldırıldı
- ✅ Backend Express.js uygulaması başlatıldı
- ✅ Frontend React + Vite uygulaması başlatıldı
- ✅ Prisma ORM entegre edildi
- ✅ Veritabanı şeması tasarlandı (ER diyagram)
- ✅ API endpoint yapısı planlandı

### Sprint 2 (Hafta 3) ✅
- ✅ User model oluşturuldu
- ✅ JWT authentication implementasyonu
- ✅ Login/Register API endpoints
- ✅ Refresh token mekanizması
- ✅ Auth middleware
- ✅ Error handling middleware
- ✅ Login page UI
- ✅ Protected routes (React Router)
- ✅ Auth context ve hooks

### Sprint 3 (Hafta 4) ✅
- ✅ Branch model oluşturuldu
- ✅ Branch CRUD API endpoints
- ✅ Branch management UI tamamlandı
- ✅ Branch filtering ve search
- ✅ Branch selection component

### Sprint 4 (Hafta 5) ✅
- ✅ Product & Category models kontrol edildi
- ✅ Product CRUD API endpoints
- ✅ Category CRUD API endpoints
- ✅ Product list UI (pagination, search, filter)
- ✅ Product form (create/edit)
- ✅ Category hiyerarşik yapı

---

## 🎯 Gelecek Adımlar (Priority Order)

### Bu Hafta (Hafta 5-6)
1. **Product Management Tamamlama**
   -

2. **Inventory Management Başlangıç**
   - [x] Inventory model (Prisma schema'da var)
   - [ ] Stock tracking API
   - [ ] Stock transfer API
   - [ ] Stock adjustment API
   - [ ] Basic inventory UI

### Önümüzdeki 2 Hafta (Hafta 7-8)
3. **Inventory Management Tam Implementasyon**
   - [ ] Inventory dashboard UI
   - [ ] Stock transfer form
   - [ ] Stock adjustment form
   - [ ] Low stock alerts

4. **POS & Sales Başlangıç**
   - [x] Sales model (Prisma schema'da var)
   - [ ] Create sale API
   - [ ] Sale details API
   - [ ] POS screen UI improvements

### Gelecek Ay (Hafta 8-11)
5. **POS System (En Kritik)**
   - [ ] Sales flow implementasyonu
   - [ ] POS ekranı UI
   - [ ] Barcode scanner entegrasyonu
   - [ ] Payment processing
   - [ ] Receipt printing

6. **Customer Management**
   - [ ] Customer CRUD
   - [ ] Cari hesap tracking
   - [ ] Payment recording

### 2-3 Ay İçinde
7. **Reporting & Analytics**
8. **Localization (4 dil)**
9. **Testing & QA**
10. **Production Deployment**

---

## 🔌 API Endpoints Checklist

### Authentication Module
- [x] `POST /api/auth/register` - Yeni kullanıcı kaydı
- [x] `POST /api/auth/login` - Kullanıcı girişi
- [x] `POST /api/auth/refresh` - Token yenileme
- [x] `POST /api/auth/logout` - Çıkış

### Branch Management
- [x] `GET /api/branches` - Şube listesi
- [x] `GET /api/branches/:id` - Şube detayı
- [x] `POST /api/branches` - Yeni şube
- [x] `PUT /api/branches/:id` - Şube güncelle
- [x] `DELETE /api/branches/:id` - Şube sil

### Product Management
- [x] `GET /api/products` - Ürün listesi
- [x] `GET /api/products/:id` - Ürün detayı
- [x] `GET /api/products/barcode/:barcode` - Barkod ile ürün bul
- [x] `POST /api/products` - Yeni ürün
- [x] `PUT /api/products/:id` - Ürün güncelle
- [x] `DELETE /api/products/:id` - Ürün sil
- [x] `POST /api/products/import` - Toplu ürün içe aktarma
- [x] `GET /api/products/import/template` - İçe aktarma şablonu
- [x] `POST /api/products/upload-image` - Ürün görseli yükle

### Category Management
- [x] `GET /api/categories` - Kategori listesi (hiyerarşik)
- [x] `GET /api/categories/roots` - Kök kategoriler
- [x] `GET /api/categories/:id` - Kategori detayı
- [x] `POST /api/categories` - Yeni kategori
- [x] `PUT /api/categories/:id` - Kategori güncelle
- [x] `DELETE /api/categories/:id` - Kategori sil

### Inventory Management
- [x] `GET /api/inventory` - Stok durumu
- [x] `GET /api/inventory/low-stock` - Düşük stok uyarıları
- [x] `GET /api/inventory/branch/:branchId` - Şube stok durumu
- [x] `GET /api/inventory/product/:productId` - Ürün stok durumu
- [x] `GET /api/inventory/:branchId/:productId` - Belirli stok kalemi
- [x] `POST /api/inventory` - Stok oluştur/güncelle

### Stock Transfer
- [x] `GET /api/stock-transfers` - Transfer listesi
- [x] `GET /api/stock-transfers/:id` - Transfer detayı
- [x] `POST /api/stock-transfers` - Yeni transfer
- [x] `POST /api/stock-transfers/:id/complete` - Transfer tamamla
- [x] `POST /api/stock-transfers/:id/cancel` - Transfer iptal

### Stock Adjustment
- [x] `GET /api/stock-adjustments` - Düzeltme listesi
- [x] `GET /api/stock-adjustments/:id` - Düzeltme detayı
- [x] `POST /api/stock-adjustments` - Yeni düzeltme

### Sales (POS)
- [x] `POST /api/sales` - Yeni satış
- [x] `GET /api/sales` - Satış listesi
- [x] `GET /api/sales/:id` - Satış detayı
- [x] `GET /api/sales/number/:saleNumber` - Satış numarası ile bul
- [x] `GET /api/sales/:id/receipt` - Fiş oluştur
- [x] `POST /api/sales/:id/refund` - İade işlemi

### Customer Management
- [ ] `GET /api/customers` - Müşteri listesi
- [ ] `GET /api/customers/:id` - Müşteri detayı
- [ ] `POST /api/customers` - Yeni müşteri
- [ ] `PUT /api/customers/:id` - Müşteri güncelle
- [ ] `DELETE /api/customers/:id` - Müşteri sil
- [ ] `GET /api/customers/:id/transactions` - Cari hareketler
- [ ] `POST /api/customers/:id/payments` - Ödeme kaydet

### Reports
- [x] `GET /api/reports/sales-summary` - Satış özeti
- [x] `GET /api/reports/inventory-status` - Stok durumu
- [x] `GET /api/reports/top-products` - En çok satanlar
- [x] `GET /api/reports/debt-summary` - Borç özeti
- [x] `GET /api/reports/cash-register` - Gün sonu kasa raporu

### Dashboard
- [x] `GET /api/dashboard/overview` - Dashboard özet

### User Management
- [ ] `GET /api/users` - Kullanıcı listesi
- [ ] `PUT /api/users/:id` - Kullanıcı güncelle
- [ ] `DELETE /api/users/:id` - Kullanıcı sil
- [ ] `PUT /api/users/:id/password` - Şifre değiştir

---

## 🗄️ Veritabanı Schema

### Tamamlanan Tablolar
- [x] `users` - Kullanıcılar
- [x] `branches` - Şubeler
- [x] `categories` - Kategoriler (hiyerarşik)
- [x] `products` - Ürünler
- [x] `inventory` - Stok durumu
- [x] `customers` - Müşteriler
- [x] `sales` - Satışlar
- [x] `sale_items` - Satış kalemleri
- [x] `customer_transactions` - Cari hareketler
- [x] `stock_transfers` - Stok transferleri
- [x] `stock_transfer_items` - Transfer kalemleri
- [x] `stock_adjustments` - Stok düzeltmeleri

**Not:** Tüm tablolar Prisma schema'da tanımlı. API ve UI implementasyonları devam ediyor.

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Auth service tests
- [ ] Product service tests
- [ ] Sales service tests
- [ ] Inventory service tests
- [ ] Customer service tests

### Integration Tests
- [ ] Auth API tests
- [ ] Product API tests
- [ ] Sales API tests
- [ ] Inventory API tests

### E2E Tests
- [ ] Login flow
- [ ] Product create flow
- [ ] POS sale flow
- [ ] Stock transfer flow

### Coverage Target
- [ ] Backend: %80+
- [ ] Frontend: %70+

---

## 🚢 Deployment Guide

### Development
```bash
# Clone repository
git clone https://github.com/your-org/vidalita-retail-manager.git
cd vidalita-retail-manager

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Production
```bash
# Build and start
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Backup Database
```bash
# Manual backup
./scripts/backup-db.sh

# Automated (cron)
0 2 * * * /path/to/scripts/backup-db.sh
```

---

## 📊 Progress Tracker

### Genel İlerleme
```
███████████████████████░░░░░ 58% Tamamlandı

Backend:  ████████████████░░░░░░ 70%
Frontend: ███████████░░░░░░░░░░░ 55%
Testing:  ░░░░░░░░░░░░░░░░░░░░░░░░  0%
DevOps:   ██████████░░░░░░░░░░░░░░ 40%
```

### Modül İlerlemesi
| Modül | Backend | Frontend | Test | Durum |
|-------|---------|----------|------|-------|
| Auth | 100% | 100% | 0% | ✅ |
| Branch | 100% | 100% | 0% | ✅ |
| Product | 100% | 100% | 0% | ✅ |
| Category | 100% | 100% | 0% | ✅ |
| Inventory | 100% | 85% | 0% | 🔄 |
| Stock Transfer | 100% | 70% | 0% | 🔄 |
| Stock Adjustment | 100% | 70% | 0% | 🔄 |
| Sales | 100% | 70% | 0% | 🔄 |
| Customer | 100% | 80% | 0% | 🔄 |
| Reports | 100% | 75% | 0% | 🔄 |

---

## 👥 Team & Contributors

### Current Team
- **Lead Developer**: [İsim]
- **Backend Developer**: [İsim]
- **Frontend Developer**: [İsim]
- **DevOps Engineer**: [İsim]
- **QA Engineer**: [İsim]

### How to Contribute
1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 Support & Contact

- **Documentation**: https://docs.vidalita.com
- **Issue Tracker**: https://github.com/your-org/vidalita-retail-manager/issues
- **Email**: dev@vidalita.com
- **Slack**: vidalita.slack.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Acknowledgments

- Prisma ORM documentation
- Express.js community
- React documentation
- TailwindCSS team

---

**Son Güncelleme**: 25 Kasım 2025
**Versiyon**: 0.3.5-alpha
**Durum**: Active Development 🚀