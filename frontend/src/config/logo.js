// Logo configuration
// Logo URL'leri buradan yönetilir
// CDN URL'leri veya local path kullanılabilir

// Favicon URL (V harfi yerine kullanılacak)
export const FAVICON_URL = 'https://vidalita.com.tr/wp-content/uploads/2025/11/cropped-favicon.png';

// Navbar ve Login için logo (vidalita.com.tr)
export const LOGO_URL = 'https://vidalita.com.tr/wp-content/uploads/2025/11/logo-220x50.webp';

// Fatura ve Raporlar için logo (vidalita.com.tr)
export const LOGO_URL_INVOICE = 'https://vidalita.com.tr/wp-content/uploads/2025/11/logo-220x50.webp';

// Logo URL'ini türüne göre döndür
export const getLogoUrl = (type = 'default') => {
  switch (type) {
    case 'invoice':
    case 'report':
      return LOGO_URL_INVOICE;
    case 'navbar':
    case 'login':
    case 'default':
    default:
      return LOGO_URL;
  }
};

