/**
 * Format currency amount based on currency code
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (UZS, USD, TRY, EUR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'UZS') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00';
  }

  const currencyMap = {
    UZS: {
      locale: 'uz-UZ',
      currency: 'UZS',
      symbol: 'so\'m',
    },
    USD: {
      locale: 'en-US',
      currency: 'USD',
      symbol: '$',
    },
    TRY: {
      locale: 'tr-TR',
      currency: 'TRY',
      symbol: '₺',
    },
    EUR: {
      locale: 'de-DE',
      currency: 'EUR',
      symbol: '€',
    },
  };

  const currencyInfo = currencyMap[currency] || currencyMap.UZS;

  try {
    // For UZS, show without decimals, for others show 2 decimals
    const options = {
      style: 'currency',
      currency: currencyInfo.currency,
      minimumFractionDigits: currency === 'UZS' ? 0 : 2,
      maximumFractionDigits: currency === 'UZS' ? 0 : 2,
    };

    return new Intl.NumberFormat(currencyInfo.locale, options).format(amount);
  } catch (error) {
    // Fallback formatting
    const formatted = currency === 'UZS' 
      ? Math.round(amount).toLocaleString('uz-UZ')
      : parseFloat(amount).toFixed(2);
    return `${formatted} ${currencyInfo.symbol}`;
  }
};

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency = 'UZS') => {
  const symbols = {
    UZS: 'so\'m',
    USD: '$',
    TRY: '₺',
    EUR: '€',
  };
  return symbols[currency] || symbols.UZS;
};

