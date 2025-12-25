# Electron Desktop Application

Bu klasör Electron masaüstü uygulaması için gerekli dosyaları içerir.

## 📁 Dosyalar

- `main.js`: Electron ana process dosyası (backend ve frontend yönetimi)
- `preload.js`: Güvenlik için preload script (contextBridge)
- `icon.ico`: Uygulama ikonu (oluşturulmalı)

## 🚀 Hızlı Başlangıç

### Development Modunda Çalıştırma

```powershell
# Root dizinden
npm run electron:dev
```

Bu komut:
- Backend'i otomatik başlatır (port 3000 veya boş port bulur)
- Frontend build'ini yükler (varsa) veya Vite dev server'ı kullanır
- Electron penceresini açar

### Exe Dosyası Oluşturma

```powershell
# 1. Frontend'i Electron için build et
npm run build:frontend:electron

# 2. Backend Prisma generate (gerekirse)
cd backend
npx prisma generate
cd ..

# 3. Exe oluştur
npm run electron:build:win
```

**VEYA** tek komutla:

```powershell
npm run build:all
```

Exe dosyası `dist/` klasöründe oluşur: `Vidalita-POS-1.0.0-portable.exe`

## ⚙️ Yapılandırma

### Frontend Build (ÖNEMLİ)

**Electron için frontend build yaparken `ELECTRON=true` kullanılmalı:**

```powershell
cd frontend
$env:ELECTRON='true'
npm run build
```

Bu:
- Asset path'lerini relative yapar (`./assets/...`)
- `file://` protokolü için optimize eder
- Vercel/web deployment ayarlarını devre dışı bırakır

### Backend Port Yönetimi

Electron otomatik olarak:
- Port 3000'i kontrol eder
- Kullanılıyorsa boş port bulur (3001, 3002, vb.)
- Port bilgisini frontend'e runtime'da iletir

Frontend otomatik olarak doğru port'u kullanır (build-time sabitlenmez).

### Veritabanı Yapılandırması

Portable exe için veritabanı seçenekleri:

1. **PostgreSQL (Mevcut)**: 
   - Kullanıcının sisteminde PostgreSQL kurulu olmalı
   - `backend/.env` dosyasında doğru bağlantı bilgileri olmalı

2. **SQLite (Önerilen - Portable için)**: 
   - Daha kolay dağıtım
   - Kurulum gerektirmez
   - Prisma schema'yı SQLite'a geçirmek gerekir

## 🔧 Script'ler

- `npm run electron:dev`: Development modunda çalıştır
- `npm run electron:build:win`: Windows portable exe oluştur
- `npm run build:frontend:electron`: Frontend'i Electron için build et
- `npm run build:all`: Tümünü build et ve exe oluştur

## 📝 Notlar

1. **Frontend Build**: Her zaman `ELECTRON=true` ile build edin
2. **Port Çakışması**: Electron otomatik olarak boş port bulur
3. **SSL Hataları**: Development'ta görünebilir, zararsızdır (log-level: 3 ile gizlenir)
4. **Icon**: `electron/icon.ico` dosyası oluşturulmalı (256x256 veya 512x512 piksel)

## 🐛 Sorun Giderme

### Frontend yüklenmiyor
- Frontend build edildiğinden emin olun: `npm run build:frontend:electron`
- `frontend/dist/` klasörünün var olduğunu kontrol edin

### Backend başlamıyor
- Port çakışması: Electron otomatik olarak boş port bulur
- `.env` dosyasının doğru yapılandırıldığından emin olun

### Exe çalışmıyor
- Windows Defender veya antivirüs yazılımı engelliyor olabilir
- Exe'yi yönetici olarak çalıştırmayı deneyin
- Log dosyalarını kontrol edin (`backend/logs/`)
