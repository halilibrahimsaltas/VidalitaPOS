// Logo configuration
// Logo URL'leri buradan yönetilir
// CDN URL'leri veya local path kullanılabilir

// Navbar ve Login için logo (Instagram CDN)
export const LOGO_URL = 'https://instagram.ftas2-2.fna.fbcdn.net/v/t51.2885-19/562034711_17846814741580154_1256861690439188287_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.ftas2-2.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2QHBzECyjtuZVOZPikgk_AEYJs9b6onFvukv2Xlte4PTqu1dNVz-IlfGU86C8lYcG5w&_nc_ohc=r6gmv3BKjqgQ7kNvwErJCcJ&_nc_gid=yYBWcF7JVbxA9xT9YlZ7xw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Afnv-Qdhphey8gU_bYJSt7djPcSilG3_y3j3JcfDPOcikw&oe=69556677&_nc_sid=8b3546';

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

