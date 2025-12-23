# 🚀 VidalitaPOS Demo Deployment Guide

## 📋 Genel Bakış

Bu dokümanda, VidalitaPOS uygulamasını canlıya almak için gerekli adımlar detaylı olarak açıklanmaktadır.

**Mimari:**
- **Frontend (React + Vite)** → Vercel
- **Backend (Node.js + Express)** → Render
- **Database (PostgreSQL)** → Render

---

## 🎯 ADIM 1: BACKEND → RENDER DEPLOYMENT

### 1.1 Render Hesabı Oluşturma

1. https://render.com adresine gidin
2. "Get Started for Free" butonuna tıklayın
3. GitHub hesabınızla giriş yapın
4. Email doğrulaması yapın

### 1.2 Backend Service Oluşturma

1. Render dashboard'da "New +" → "Web Service"
2. GitHub repository'nizi bağlayın (eğer bağlı değilse)
3. Repository'nizi seçin
4. **Name**: `vidalita-backend` (veya istediğiniz isim)
5. **Root Directory**: `backend` olarak ayarlayın
6. **Environment**: `Node` seçin
7. **Build Command**: `npm install && npx prisma generate`
8. **Start Command**: `npm run start:prod` (migration'ı içerir)

### 1.3 PostgreSQL Database Ekleme

1. Render dashboard'da "New +" → "PostgreSQL"
2. **Name**: `vidalita-postgres` (veya istediğiniz isim)
3. **Database**: `vidalita_retail`
4. **User**: `vidalita_user`
5. **Plan**: Free (veya istediğiniz plan)
6. "Create Database" butonuna tıklayın
7. Render otomatik olarak `DATABASE_URL` environment variable'ını oluşturacak

### 1.4 Environment Variables Ayarlama

Render dashboard'da backend service'inizde "Environment" sekmesine gidin ve şunları ekleyin:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<Render PostgreSQL otomatik verir - Internal Database URL kullanın>
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
FRONTEND_URL=https://your-frontend.vercel.app
# Vercel URL'ini buraya yazın (deploy sonrası güncelleyin)
```

**ÖNEMLİ:** 
- `DATABASE_URL` için Render PostgreSQL'in "Internal Database URL" değerini kullanın
- `JWT_SECRET` ve `JWT_REFRESH_SECRET` için güçlü random string'ler kullanın:
```bash
# Terminal'de güçlü secret oluştur:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.5 render.yaml Kullanımı (Opsiyonel)

Proje root'unda `backend/render.yaml` dosyası mevcut. Bu dosya ile Render otomatik olarak service'leri oluşturabilir:

1. Render dashboard'da "New +" → "Blueprint"
2. GitHub repository'nizi seçin
3. Render otomatik olarak `render.yaml` dosyasını okuyacak ve service'leri oluşturacak

**Not:** Manuel oluşturma tercih ederseniz, yukarıdaki adımları takip edin.

### 1.6 Prisma Migration

**✅ Otomatik Migration:** `render.yaml` dosyasında start command'a migration eklendi. Her deploy'da server başlamadan önce otomatik olarak çalışacak.

Start command:
```bash
npm run start:prod
```

Bu command şunları yapar:
1. `npx prisma migrate deploy` - Migration'ları uygular
2. `node src/server.js` - Server'ı başlatır

**Not:** 
- Migration'lar idempotent'tir (zaten uygulanmışsa tekrar uygulanmaz), bu yüzden her deploy'da güvenle çalıştırılabilir
- Build sırasında database'e erişim olmayabilir, bu yüzden migration start command'da çalışır
- Render dashboard'da "Events" sekmesinden logları kontrol ederek migration'ın başarıyla çalıştığını doğrulayın

### 1.7 Backend URL'ini Not Edin

Render deploy tamamlandıktan sonra:
- Render otomatik olarak bir URL oluşturur: `https://vidalita-backend.onrender.com`
- Veya "Settings" → "Custom Domain" ile custom domain ekleyebilirsiniz
- Backend URL'inizi not edin

---

## 🎯 ADIM 2: FRONTEND → VERCEL DEPLOYMENT

### 2.1 Vercel Hesabı Oluşturma

1. https://vercel.com adresine gidin
2. GitHub hesabınızla giriş yapın
3. "Add New Project" butonuna tıklayın

### 2.2 Frontend Project Ayarları

1. Repository'nizi seçin
2. **Root Directory**: `/frontend` olarak ayarlayın
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build` (otomatik algılanır)
5. **Output Directory**: `dist` (otomatik algılanır)

### 2.3 Environment Variables

Vercel dashboard'da "Settings" → "Environment Variables" bölümünde:

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_APP_NAME=Vidalita Retail Manager
```

**⚠️ ÇOK ÖNEMLİ:** 
- Backend URL'ini Render'dan aldığınız URL ile değiştirin
- **MUTLAKA sonunda `/api` olmalı!** 
- Örnek: `https://vidalitapos.onrender.com/api` ✅
- Yanlış: `https://vidalitapos.onrender.com` ❌

### 2.4 Deploy

1. "Deploy" butonuna tıklayın
2. Vercel otomatik olarak build edecek ve deploy edecek
3. Deploy tamamlandıktan sonra frontend URL'inizi not edin: `https://your-frontend.vercel.app`

---

## 🎯 ADIM 3: CORS AYARLARI

### 3.1 Backend CORS Güncelleme

Backend'deki CORS ayarlarını güncelleyin (zaten yapıldı):

```javascript
// backend/src/app.js
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://your-frontend.vercel.app'  // Vercel URL'inizi ekleyin
  ],
  credentials: true
}));
```

### 3.2 Render'da FRONTEND_URL Güncelleme

Render dashboard'da backend service'inizde "Environment" → `FRONTEND_URL` değerini Vercel URL'iniz ile güncelleyin:

```env
FRONTEND_URL=https://your-frontend.vercel.app
```

Render otomatik olarak yeniden deploy edecek.

---

## 🎯 ADIM 4: VERİTABANI MİGRATION VE SEED

### 4.1 Migration Çalıştırma

Render dashboard'da backend service'inizde "Shell" sekmesine gidin veya "Events" → "Run Command":

```bash
npx prisma migrate deploy
```

### 4.2 Seed Data (Opsiyonel)

Eğer seed data eklemek isterseniz:

```bash
npm run seed
```

---

## 🎯 ADIM 5: TEST VE DOĞRULAMA

### 5.1 Backend Health Check

Tarayıcıda veya curl ile:

```bash
curl https://your-backend.onrender.com/health
```

Beklenen yanıt:
```json
{
  "status": "ok",
  "timestamp": "2024-12-31T..."
}
```

### 5.2 Frontend Test

1. Vercel URL'inizi açın
2. Login sayfası görünmeli
3. Default admin credentials ile giriş yapın:
   - Username: `admin`
   - Password: `admin123`

### 5.3 API Bağlantısı Test

Browser console'da:
```javascript
fetch('https://your-backend.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

---

## 🔧 TROUBLESHOOTING

### Problem: CORS Hatası

**Çözüm:**
1. Backend'deki `FRONTEND_URL` environment variable'ını kontrol edin
2. Vercel URL'inin doğru olduğundan emin olun
3. Render'da yeniden deploy edin

### Problem: Database Connection Hatası

**Çözüm:**
1. Render'da PostgreSQL service'inin çalıştığından emin olun
2. `DATABASE_URL` environment variable'ını kontrol edin (Internal Database URL kullanın)
3. Prisma migration'ın çalıştığından emin olun

### Problem: Frontend API'ye Bağlanamıyor

**Çözüm:**
1. Vercel'deki `VITE_API_URL` environment variable'ını kontrol edin
2. Backend URL'inin doğru olduğundan emin olun
3. Backend'in çalıştığından emin olun (health check)
4. Render free tier'da service'ler 15 dakika idle sonrası uykuya geçer, ilk istek yavaş olabilir

### Problem: Images Yüklenmiyor

**Çözüm:**
1. Frontend'deki `/uploads` klasörünün `public` klasöründe olduğundan emin olun
2. Vite config'deki static file serving ayarlarını kontrol edin

---

## 📝 ÖNEMLİ NOTLAR

1. **Environment Variables:**
   - Railway ve Vercel'deki environment variables'ları doğru ayarlayın
   - Production'da güçlü JWT secret'lar kullanın

2. **Database:**
   - Render PostgreSQL free tier'da sınırlı kaynak var (90 gün sonra silinir)
   - Production için daha büyük plan düşünün

3. **Domain:**
   - Render ve Vercel otomatik domain verir
   - Custom domain ekleyebilirsiniz (ücretsiz)

4. **Backup:**
   - Render PostgreSQL için otomatik backup yok (free tier)
   - Manuel backup almayı unutmayın

5. **Monitoring:**
   - Render ve Vercel dashboard'larından logları takip edin
   - Hata durumlarını kontrol edin

6. **Render Free Tier Özellikleri:**
   - Service'ler 15 dakika idle sonrası uykuya geçer
   - İlk istek yavaş olabilir (spin-up süresi)
   - PostgreSQL 90 gün sonra silinir (free tier)

---

## 🎉 BAŞARILI DEPLOYMENT KONTROL LİSTESİ

- [ ] Render'da backend deploy edildi
- [ ] PostgreSQL database eklendi
- [ ] Environment variables ayarlandı
- [ ] Prisma migration çalıştırıldı
- [ ] Backend health check başarılı
- [ ] Vercel'de frontend deploy edildi
- [ ] Frontend environment variables ayarlandı
- [ ] CORS ayarları güncellendi
- [ ] Frontend backend'e bağlanabiliyor
- [ ] Login çalışıyor
- [ ] Resimler yükleniyor

---

## 🔗 FAYDALI LİNKLER

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Deploy**: https://www.prisma.io/docs/guides/deployment

---

**Son Güncelleme**: 31 Aralık 2024

