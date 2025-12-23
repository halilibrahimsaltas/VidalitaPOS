# ✅ Deployment Checklist

## 📋 Pre-Deployment Hazırlık

### Backend Hazırlık
- [ ] `backend/package.json` build script kontrol edildi
- [ ] `backend/src/app.js` CORS ayarları güncellendi
- [ ] `backend/.env.production.example` oluşturuldu
- [ ] `backend/render.yaml` oluşturuldu
- [ ] Prisma schema migration'ları hazır

### Frontend Hazırlık
- [ ] `frontend/.env.production.example` oluşturuldu
- [ ] `frontend/vercel.json` oluşturuldu
- [ ] `frontend/public/uploads` klasörü mevcut
- [ ] Vite config uploads klasörü için ayarlandı

---

## 🚀 RENDER DEPLOYMENT (Backend)

### 1. Render Setup
- [ ] Render hesabı oluşturuldu (GitHub ile)
- [ ] Repository bağlandı
- [ ] New + → Web Service
- [ ] Root Directory: `/backend` ayarlandı

### 2. PostgreSQL Database
- [ ] New + → PostgreSQL
- [ ] Database oluşturuldu
- [ ] `DATABASE_URL` (Internal Database URL) not edildi

### 3. Environment Variables
- [ ] `NODE_ENV=production` eklendi
- [ ] `PORT=3000` eklendi
- [ ] `DATABASE_URL` eklendi (Render Internal Database URL)
- [ ] `JWT_SECRET` eklendi (güçlü random string)
- [ ] `JWT_REFRESH_SECRET` eklendi (güçlü random string)
- [ ] `JWT_ACCESS_EXPIRATION=15m` eklendi
- [ ] `JWT_REFRESH_EXPIRATION=7d` eklendi
- [ ] `FRONTEND_URL` eklendi (Vercel URL - deploy sonrası güncellenecek)

### 4. Build & Deploy Settings
- [ ] Build Command: `npm install && npx prisma generate`
- [ ] Start Command: `node scripts/migrate-and-start.js` (database retry + migration + server)
- [ ] Root Directory: `backend`
- [ ] Environment: `Node`

### 5. Deploy
- [ ] Deploy başlatıldı
- [ ] Deploy logları kontrol edildi (Events sekmesi)
- [ ] Hata yok

### 6. Prisma Migration
- [ ] Start command'da migration script eklendi: `node scripts/migrate-and-start.js`
- [ ] DATABASE_URL property: `internalDatabaseUrl` (aynı region için)
- [ ] Deploy loglarında migration'ın başarıyla çalıştığı görüldü (Events sekmesi)
- [ ] Migration başarılı - Server başlamadan önce migration çalıştı

### 7. Backend URL
- [ ] Render otomatik domain oluşturuldu
- [ ] Backend URL not edildi: `https://your-backend.onrender.com`
- [ ] Health check test edildi: `/health` endpoint

---

## 🎨 VERCEL DEPLOYMENT (Frontend)

### 1. Vercel Setup
- [ ] Vercel hesabı oluşturuldu (GitHub ile)
- [ ] Repository bağlandı
- [ ] New Project oluşturuldu

### 2. Project Settings
- [ ] Root Directory: `/frontend` ayarlandı
- [ ] Framework Preset: Vite
- [ ] Build Command: `npm run build` (otomatik)
- [ ] Output Directory: `dist` (otomatik)

### 3. Environment Variables
- [ ] `VITE_API_URL` eklendi (Render backend URL - **sonunda /api olmalı!**)
- [ ] `VITE_APP_NAME=Vidalita Retail Manager` eklendi
- [ ] `VITE_API_URL` formatı kontrol edildi: `https://your-backend.onrender.com/api`

### 4. Deploy
- [ ] Deploy başlatıldı
- [ ] Build başarılı
- [ ] Deploy başarılı

### 5. Frontend URL
- [ ] Vercel domain oluşturuldu
- [ ] Frontend URL not edildi: `https://your-frontend.vercel.app`

---

## 🔗 CORS VE BAĞLANTI AYARLARI

### Backend CORS Update
- [ ] Render'da `FRONTEND_URL` güncellendi (Vercel URL)
- [ ] Backend yeniden deploy edildi
- [ ] CORS test edildi (browser console'da)

### Frontend API Connection
- [ ] Frontend'de `VITE_API_URL` doğru
- [ ] API çağrıları çalışıyor
- [ ] Login test edildi

---

## 🧪 TEST VE DOĞRULAMA

### Backend Tests
- [ ] Health check: `GET /health` → 200 OK
- [ ] API endpoint: `GET /api/auth/login` → çalışıyor
- [ ] Database bağlantısı: Prisma queries çalışıyor

### Frontend Tests
- [ ] Sayfa yükleniyor
- [ ] Login sayfası görünüyor
- [ ] Login işlemi çalışıyor (admin/admin123)
- [ ] Dashboard yükleniyor
- [ ] Resimler görünüyor (logo, product images)

### Integration Tests
- [ ] Frontend → Backend API çağrıları çalışıyor
- [ ] CORS hatası yok
- [ ] Authentication çalışıyor
- [ ] Protected routes çalışıyor

---

## 📝 POST-DEPLOYMENT

### Security
- [ ] Default admin şifresi değiştirildi (production'da)
- [ ] JWT secrets güçlü ve unique
- [ ] Environment variables güvenli

### Monitoring
- [ ] Render logs kontrol edildi (Events sekmesi)
- [ ] Vercel logs kontrol edildi
- [ ] Error tracking aktif (opsiyonel)

### Documentation
- [ ] Deployment URL'leri dokümante edildi
- [ ] Environment variables listesi hazır
- [ ] Troubleshooting notları eklendi

---

## 🎉 BAŞARILI DEPLOYMENT!

Tüm adımlar tamamlandığında:
- ✅ Frontend: https://your-frontend.vercel.app
- ✅ Backend: https://your-backend.onrender.com
- ✅ Database: Render PostgreSQL (otomatik)

**Demo URL'lerini paylaşabilirsiniz!**

---

## 🔄 GÜNCELLEME İŞLEMLERİ

### Backend Güncelleme
1. GitHub'a push yapın
2. Render otomatik deploy edecek
3. Logları kontrol edin (Events sekmesi)

### Frontend Güncelleme
1. GitHub'a push yapın
2. Vercel otomatik deploy edecek
3. Build loglarını kontrol edin

### Database Migration
1. Render'da Shell veya Run Command
2. `npx prisma migrate deploy` çalıştırın

---

**Son Güncelleme**: 31 Aralık 2024

