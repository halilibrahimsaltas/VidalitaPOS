# Electron Desktop Uygulaması Kurulum Rehberi

Bu rehber, VidalitaPOS projesini tek bir `.exe` dosyasına paketlemek için gerekli adımları içerir.

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- npm veya yarn
- Windows 10/11 (exe oluşturmak için)

## 🚀 Kurulum Adımları

### 1. Bağımlılıkları Yükle

Proje kök dizininde (backend ve frontend'in üstünde):

```powershell
npm install
```

Bu komut:
- Electron ve electron-builder'ı yükler
- Backend ve frontend bağımlılıklarını yükler (postinstall script)

### 2. Frontend'i Build Et

```powershell
cd frontend
npm run build
cd ..
```

### 3. Backend Prisma Client'ı Generate Et

```powershell
cd backend
npx prisma generate
cd ..
```

### 4. Development Modunda Test Et

```powershell
npm run electron:dev
```

Bu komut:
- Backend'i başlatır (port 3000)
- Frontend'i development modunda açar
- Electron penceresini açar

## 📦 Exe Dosyası Oluşturma

### Windows Portable Exe Oluştur

```powershell
npm run electron:build:win
```

Bu komut:
- Frontend'i build eder (eğer build edilmemişse)
- Backend'i paketler
- Tek bir portable `.exe` dosyası oluşturur
- `dist/` klasörüne kaydeder

### Build Sonrası

Build tamamlandığında `dist/` klasöründe şu dosya oluşur:
- `Vidalita-POS-1.0.0-portable.exe`

Bu dosyayı USB'ye kopyalayıp herhangi bir Windows bilgisayarda çalıştırabilirsiniz.

## ⚙️ Yapılandırma

### Veritabanı Yapılandırması

**Önemli**: Şu anda proje PostgreSQL kullanıyor. Portable exe için iki seçenek var:

#### Seçenek 1: PostgreSQL (Mevcut)
- Kullanıcının sisteminde PostgreSQL kurulu olmalı
- `backend/.env` dosyasında doğru bağlantı bilgileri olmalı
- İlk çalıştırmada migration'lar çalıştırılmalı

#### Seçenek 2: SQLite (Önerilen - Portable için)
- Daha kolay dağıtım
- Kurulum gerektirmez
- Prisma schema'yı SQLite'a geçirmek gerekir

SQLite'a geçiş için:
1. `backend/prisma/schema.prisma` dosyasında:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
2. `backend/.env` dosyasında:
   ```env
   DATABASE_URL="file:./data/database.db"
   ```
3. Migration'ları yeniden oluştur

### Icon Dosyası

`electron/icon.ico` dosyası oluşturulmalı (256x256 veya 512x512 piksel). 
Eğer icon yoksa, Electron varsayılan icon'u kullanır.

## 🔧 Script'ler

- `npm run electron:dev`: Development modunda çalıştır
- `npm run electron:build`: Tüm platformlar için build
- `npm run electron:build:win`: Sadece Windows için build
- `npm run build:frontend`: Frontend'i build et
- `npm run build:backend`: Backend'i build et
- `npm run build:all`: Tümünü build et ve exe oluştur

## 📝 Notlar

1. **İlk Çalıştırma**: İlk çalıştırmada Prisma migration'ları çalıştırılmalı:
   ```powershell
   cd backend
   npx prisma migrate deploy
   cd ..
   ```

2. **Veritabanı**: Portable exe için SQLite kullanmak daha pratik olur.

3. **Uploads Klasörü**: Upload edilen dosyalar `backend/uploads/` klasöründe saklanır. 
   Bu klasör exe ile birlikte paketlenmez, her çalıştırmada oluşturulur.

4. **Logs**: Backend logları `backend/logs/` klasöründe saklanır.

## 🐛 Sorun Giderme

### Backend başlamıyor
- Node.js'in PATH'te olduğundan emin olun
- `backend/.env` dosyasının doğru yapılandırıldığından emin olun
- Port 3000'in kullanılabilir olduğundan emin olun

### Frontend yüklenmiyor
- Frontend'in build edildiğinden emin olun (`npm run build:frontend`)
- `frontend/dist/` klasörünün var olduğundan emin olun

### Exe çalışmıyor
- Windows Defender veya antivirüs yazılımı engelliyor olabilir
- Exe'yi yönetici olarak çalıştırmayı deneyin
- Log dosyalarını kontrol edin (`backend/logs/`)

## 📚 Daha Fazla Bilgi

- [Electron Dokümantasyonu](https://www.electronjs.org/docs)
- [Electron Builder Dokümantasyonu](https://www.electron.build/)

