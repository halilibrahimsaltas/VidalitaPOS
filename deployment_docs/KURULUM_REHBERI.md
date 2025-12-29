# Vidalita POS Kurulum Rehberi

## 📋 Sistem Gereksinimleri

### Minimum Gereksinimler:
- **İşletim Sistemi**: Windows 10 veya üzeri (64-bit)
- **RAM**: En az 4 GB
- **Disk Alanı**: En az 2 GB boş alan
- **Node.js**: v18.0.0 veya üzeri (Backend için)
- **PostgreSQL**: v14 veya üzeri

### Önerilen Gereksinimler:
- **RAM**: 8 GB veya üzeri
- **Disk Alanı**: 5 GB boş alan
- **Node.js**: v20.x LTS
- **PostgreSQL**: v15 veya üzeri

---

## 🔧 Kurulum Adımları

### 1. Node.js Kurulumu

1. [Node.js resmi sitesinden](https://nodejs.org/) LTS sürümünü indirin
2. İndirilen `.msi` dosyasını çalıştırın
3. Kurulum sırasında "Add to PATH" seçeneğinin işaretli olduğundan emin olun
4. Kurulumu tamamlayın
5. PowerShell veya Command Prompt'u açın ve kontrol edin:
   ```powershell
   node --version
   npm --version
   ```
   Her ikisi de versiyon numarası göstermelidir.

### 2. PostgreSQL Kurulumu

1. [PostgreSQL resmi sitesinden](https://www.postgresql.org/download/windows/) Windows installer'ı indirin
2. İndirilen `.exe` dosyasını çalıştırın
3. Kurulum sırasında:
   - **Port**: 5432 (varsayılan)
   - **Superuser (postgres) şifresi**: Güçlü bir şifre belirleyin ve not edin
   - **Locale**: Turkish, Turkey (veya ihtiyacınıza göre)
4. Kurulumu tamamlayın
5. PostgreSQL'in kurulduğunu kontrol edin:
   ```powershell
   psql --version
   ```

### 3. Veritabanı Oluşturma

1. **pgAdmin** veya **psql** kullanarak PostgreSQL'e bağlanın
2. Yeni bir veritabanı oluşturun:
   ```sql
   CREATE DATABASE vidalita_pos;
   ```
3. Veritabanının oluşturulduğunu kontrol edin

**Alternatif (psql ile):**
```powershell
# PostgreSQL'in bin klasörüne gidin (genellikle C:\Program Files\PostgreSQL\15\bin)
cd "C:\Program Files\PostgreSQL\15\bin"

# psql'e bağlanın (postgres kullanıcısı ile)
.\psql.exe -U postgres

# Veritabanını oluşturun
CREATE DATABASE vidalita_pos;

# Çıkış yapın
\q
```

### 4. Vidalita POS Kurulumu

#### Seçenek A: Paketlenmiş Uygulama (.exe) ile Kurulum

1. `Vidalita POS-1.0.0-Setup.exe` dosyasını indirin
2. Setup dosyasını çalıştırın
3. Kurulum dizinini seçin (varsayılan: `C:\Program Files\Vidalita POS`)
4. Kurulumu tamamlayın
5. Masaüstü kısayolundan uygulamayı başlatın

#### Seçenek B: Kaynak Koddan Kurulum (Geliştiriciler için)

1. Proje klasörünü kopyalayın
2. PowerShell'i yönetici olarak açın
3. Proje klasörüne gidin:
   ```powershell
   cd C:\Users\User\Desktop\VidalitaPOS
   ```
4. Bağımlılıkları yükleyin:
   ```powershell
   npm install
   ```
   Bu komut hem root, hem backend, hem de frontend bağımlılıklarını yükler.

### 5. Backend Yapılandırması

1. `backend` klasörüne gidin:
   ```powershell
   cd backend
   ```

2. `.env` dosyası oluşturun:
   ```powershell
   Copy-Item .env.production.example .env
   ```

3. `.env` dosyasını düzenleyin ve aşağıdaki bilgileri girin:
   ```env
   # Environment
   NODE_ENV=production
   PORT=3000

   # Database (PostgreSQL bağlantı bilgileriniz)
   DATABASE_URL=postgresql://postgres:SIFRENIZ@localhost:5432/vidalita_pos

   # JWT Secrets (Güçlü random string'ler oluşturun!)
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars_here_change_this
   JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars_here_change_this
   JWT_ACCESS_EXPIRATION=15m
   JWT_REFRESH_EXPIRATION=7d

   # Frontend URL (Electron için localhost kullanın)
   FRONTEND_URL=http://localhost:5173
   ```

   **ÖNEMLİ**: 
   - `DATABASE_URL` içindeki `SIFRENIZ` kısmını PostgreSQL kurulumunda belirlediğiniz şifre ile değiştirin
   - `JWT_SECRET` ve `JWT_REFRESH_SECRET` için güçlü random string'ler oluşturun (en az 32 karakter)

4. Prisma Client'ı oluşturun:
   ```powershell
   npx prisma generate
   ```

5. Veritabanı migration'larını çalıştırın:
   ```powershell
   npx prisma migrate deploy
   ```

6. Veritabanını seed (başlangıç verileri) ile doldurun:
   ```powershell
   npx prisma db seed
   ```

   Bu komut şunları oluşturur:
   - Admin kullanıcı: `admin` / `admin123`
   - Manager kullanıcı: `manager` / `manager123`
   - Cashier kullanıcı: `cashier` / `cashier123`
   - User kullanıcı: `user` / `user123`
   - 2 fiyat listesi (1. Liste ve 2. Liste)

### 6. Uygulamayı Başlatma

#### Paketlenmiş Uygulama (.exe) ile:
1. Masaüstü kısayolundan veya Başlat menüsünden "Vidalita POS"u açın
2. Uygulama otomatik olarak backend'i başlatır ve frontend'i yükler

#### Kaynak Koddan:
1. Root klasörde:
   ```powershell
   npm run electron:dev
   ```

---

## ✅ Kurulum Kontrolü

### 1. PostgreSQL Kontrolü
```powershell
# PostgreSQL servisinin çalıştığını kontrol edin
Get-Service -Name postgresql*
```

### 2. Veritabanı Bağlantısı Kontrolü
```powershell
cd backend
npx prisma studio
```
Bu komut Prisma Studio'yu açar ve veritabanı bağlantısını test eder.

### 3. Backend Kontrolü
```powershell
cd backend
npm start
```
Backend `http://localhost:3000` adresinde çalışmalıdır.

---

## 🔐 İlk Giriş

1. Uygulamayı açın
2. Login ekranında:
   - **Kullanıcı Adı**: `admin`
   - **Şifre**: `admin123`
3. İlk girişten sonra şifrenizi değiştirmeniz önerilir

---

## 🛠️ Sorun Giderme

### PostgreSQL Bağlantı Hatası

**Hata**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Çözüm**:
1. PostgreSQL servisinin çalıştığını kontrol edin:
   ```powershell
   Get-Service -Name postgresql*
   ```
2. Servis çalışmıyorsa başlatın:
   ```powershell
   Start-Service postgresql-x64-15  # Versiyon numaranızı değiştirin
   ```

### Node.js Bulunamadı Hatası

**Hata**: `'node' is not recognized as an internal or external command`

**Çözüm**:
1. Node.js'in kurulu olduğunu kontrol edin:
   ```powershell
   node --version
   ```
2. Kurulu değilse Node.js'i yükleyin
3. PowerShell'i yeniden başlatın

### Port 3000 Kullanımda Hatası

**Hata**: `Error: listen EADDRINUSE: address already in use :::3000`

**Çözüm**:
1. Port 3000'i kullanan uygulamayı bulun:
   ```powershell
   netstat -ano | findstr :3000
   ```
2. Process ID'yi not edin ve sonlandırın:
   ```powershell
   taskkill /PID <PID_NUMARASI> /F
   ```

### Prisma Migration Hatası

**Hata**: `Migration failed`

**Çözüm**:
1. Veritabanı bağlantısını kontrol edin
2. `.env` dosyasındaki `DATABASE_URL`'i kontrol edin
3. Veritabanının var olduğundan emin olun
4. Migration'ları sıfırlayın (DİKKAT: Veriler silinir):
   ```powershell
   npx prisma migrate reset
   ```

---

## 📦 Güncelleme

1. Yeni sürümü indirin
2. Eski uygulamayı kapatın
3. Yeni setup dosyasını çalıştırın
4. Kurulum dizinini aynı seçin (üzerine yazılır)
5. Uygulamayı başlatın

---

## 🗑️ Kaldırma

1. Windows Ayarlar > Uygulamalar > Vidalita POS > Kaldır
2. Veya Control Panel > Programs and Features > Vidalita POS > Uninstall

**NOT**: Kaldırma işlemi veritabanını silmez. Veritabanını manuel olarak silmek isterseniz:
```sql
DROP DATABASE vidalita_pos;
```

---

## 📞 Destek

Sorun yaşarsanız:
1. Log dosyalarını kontrol edin: `backend/logs/`
2. PostgreSQL log'larını kontrol edin
3. Windows Event Viewer'ı kontrol edin

---

## 📝 Notlar

- **Güvenlik**: Production ortamında mutlaka şifreleri değiştirin
- **Yedekleme**: Düzenli olarak veritabanını yedekleyin
- **Güncellemeler**: Düzenli olarak Node.js ve PostgreSQL güncellemelerini kontrol edin
- **Firewall**: Windows Firewall'un 3000 portunu engellemediğinden emin olun

---

## 🎯 Hızlı Kurulum Özeti

1. ✅ Node.js kur (v18+)
2. ✅ PostgreSQL kur (v14+)
3. ✅ Veritabanı oluştur (`vidalita_pos`)
4. ✅ `.env` dosyasını yapılandır
5. ✅ `npx prisma generate`
6. ✅ `npx prisma migrate deploy`
7. ✅ `npx prisma db seed`
8. ✅ Uygulamayı başlat

**Toplam süre**: ~30-45 dakika

