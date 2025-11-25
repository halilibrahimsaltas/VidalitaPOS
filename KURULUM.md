# 🚀 Vidalita Retail Manager - Kurulum Rehberi

## 📋 Ön Gereksinimler

- ✅ Node.js v20+ LTS (https://nodejs.org/)
- ✅ PostgreSQL 15+ (local kurulum)
- ✅ npm veya yarn

## 🔧 Adım Adım Kurulum

### 1️⃣ PostgreSQL Veritabanı Hazırlığı

PostgreSQL'inizin çalıştığından emin olun ve bir veritabanı oluşturun:

```sql
-- PostgreSQL'e bağlanın (psql veya pgAdmin)
CREATE DATABASE vidalita_retail;
```

### 2️⃣ Backend Kurulumu

```bash
# Backend klasörüne gidin
cd backend

# Bağımlılıkları yükleyin
npm install

# .env dosyası oluşturun
# Windows PowerShell:
Copy-Item .env.example .env

# Linux/Mac:
# cp .env.example .env
```

**`.env` dosyasını düzenleyin:**

```env
NODE_ENV=development
PORT=3000

# Database - PostgreSQL bağlantı bilgilerinizi girin
DATABASE_URL="postgresql://postgres:ŞİFRENİZ@localhost:5432/vidalita_retail?schema=public"

# JWT - Güvenli rastgele stringler oluşturun
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_change_in_production



JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

**Veritabanı migration ve seed:**

```bash
# Prisma client oluştur
npx prisma generate

# Veritabanı migration çalıştır
npx prisma migrate dev --name init

# Seed data (admin kullanıcı oluştur)
npm run seed
```

**Backend'i başlatın:**

```bash
npm run dev
```

Backend şu adreste çalışacak: `http://localhost:3000`

### 3️⃣ Frontend Kurulumu

Yeni bir terminal açın:

```bash
# Frontend klasörüne gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# .env dosyası oluşturun (opsiyonel - varsayılan değerler kullanılacak)
# Windows PowerShell:
# New-Item -Path .env -ItemType File

# .env dosyasına şunu ekleyin:
# VITE_API_URL=http://localhost:3000/api
```

**Frontend'i başlatın:**

```bash
npm run dev
```

Frontend şu adreste çalışacak: `http://localhost:5173`

### 4️⃣ İlk Giriş

Tarayıcıda `http://localhost:5173` adresine gidin ve giriş yapın:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **ÖNEMLİ**: İlk girişten sonra şifreyi değiştirmeyi unutmayın!

## ✅ Kurulum Kontrolü

### Backend Kontrolü

```bash
# Health check
curl http://localhost:3000/health

# Beklenen yanıt:
# {"status":"ok","timestamp":"2025-11-25T..."}
```

### Frontend Kontrolü

Tarayıcıda `http://localhost:5173` adresine gidin ve login sayfasını görmelisiniz.

## 🐛 Sorun Giderme

### PostgreSQL Bağlantı Hatası

- PostgreSQL servisinin çalıştığından emin olun
- `DATABASE_URL` içindeki bilgilerin doğru olduğunu kontrol edin
- Veritabanının oluşturulduğunu kontrol edin

### Port Zaten Kullanımda

- Backend portu (3000) kullanımdaysa `.env` dosyasında `PORT` değerini değiştirin
- Frontend portu (5173) kullanımdaysa `vite.config.js` dosyasında portu değiştirin

### Prisma Migration Hatası

```bash
# Migration'ları sıfırlamak için (DİKKAT: Veriler silinir!)
npx prisma migrate reset

# Sonra tekrar migration çalıştırın
npx prisma migrate dev
```

## 📚 Sonraki Adımlar

Kurulum tamamlandıktan sonra:

1. ✅ Auth modülü çalışıyor
2. 🔄 Branch Management modülüne geçilebilir
3. 📦 Product Management modülüne geçilebilir

Detaylı proje yol haritası için [vidalita-project-roadmap.md](./vidalita-project-roadmap.md) dosyasına bakın.

