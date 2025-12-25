# Electron Builder Windows Symlink Hatası Çözümü

## Sorun
Windows'ta `electron-builder` çalıştırırken symlink hatası:
```
ERROR: Cannot create symbolic link : Gereken ayrıcalık istemci tarafından sağlanmıyor
```

## Çözüm Seçenekleri

### ✅ ÇÖZÜM 1: PowerShell'i Administrator Olarak Aç (EN HIZLI)

1. PowerShell'i kapat
2. **Sağ tık** → **"Yönetici olarak çalıştır"**
3. Proje klasörüne git:
   ```powershell
   cd C:\Users\User\Desktop\VidalitaPOS
   ```
4. Build al:
   ```powershell
   npm run electron:build:win
   ```

### ✅ ÇÖZÜM 2: Windows Developer Mode Aç (ÖNERİLİR)

1. **Ayarlar** → **Gizlilik ve Güvenlik** → **Geliştiriciler için**
2. **✅ Geliştirici Modu** → **Aç**
3. Bilgisayarı yeniden başlat
4. Build al:
   ```powershell
   npm run electron:build:win
   ```

### ✅ ÇÖZÜM 3: Code Signing Tamamen Kapat (YAPILDI)

`package.json`'da zaten yapılandırıldı:
- `forceCodeSigning: false`
- `win.sign: null`

Ancak electron-builder hala `winCodeSign` indiriyor çünkü `rcedit` için de kullanılıyor.

## Notlar

- `author` field'ı eklendi (warning'i kaldırmak için)
- Code signing tamamen kapatıldı
- Portable exe oluşturulacak

## Sonuç

**En pratik çözüm:** PowerShell'i Administrator olarak aç ve build al.

Developer Mode açmak daha kalıcı bir çözüm ve Electron geliştirme için zaten önerilir.

