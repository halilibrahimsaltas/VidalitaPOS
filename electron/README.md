# Electron Desktop Application

Bu klasör Electron masaüstü uygulaması için gerekli dosyaları içerir.

## Dosyalar

- `main.js`: Electron ana process dosyası (backend ve frontend yönetimi)
- `preload.js`: Güvenlik için preload script
- `icon.ico`: Uygulama ikonu (oluşturulmalı)

## Önemli Notlar

### Veritabanı Yapılandırması

Portable exe için veritabanı yapılandırması:

1. **PostgreSQL (Mevcut)**: 
   - Kullanıcının sisteminde PostgreSQL kurulu olmalı
   - `.env` dosyasında doğru bağlantı bilgileri olmalı

2. **SQLite (Önerilen - Portable için)**:
   - Daha kolay dağıtım
   - Kurulum gerektirmez
   - Prisma schema'yı SQLite'a geçirmek gerekir

### Build İşlemi

```powershell
# 1. Bağımlılıkları yükle
npm install

# 2. Frontend'i build et
cd frontend
npm run build
cd ..

# 3. Backend Prisma generate
cd backend
npx prisma generate
cd ..

# 4. Electron uygulamasını test et
npm run electron:dev

# 5. Exe oluştur
npm run electron:build:win
```

### Icon Dosyası

`electron/icon.ico` dosyası oluşturulmalı (256x256 veya 512x512 piksel).

