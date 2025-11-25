/**
 * Barcode generation and validation utilities
 */

/**
 * Generate a unique barcode (EAN-13 format compatible)
 * @param {string} prefix - Optional prefix (default: 200)
 * @returns {string} Generated barcode
 */
export const generateBarcode = (prefix = '200') => {
  // Generate 10 random digits
  const randomDigits = Math.floor(Math.random() * 10000000000)
    .toString()
    .padStart(10, '0');

  // Combine prefix + random digits
  const barcodeWithoutCheck = prefix + randomDigits;

  // Calculate check digit (EAN-13 algorithm)
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcodeWithoutCheck[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;

  return barcodeWithoutCheck + checkDigit;
};

/**
 * Validate barcode format (EAN-13 or custom)
 * @param {string} barcode - Barcode to validate
 * @returns {boolean} True if valid
 */
export const validateBarcode = (barcode) => {
  if (!barcode || typeof barcode !== 'string') {
    return false;
  }

  // Remove spaces and hyphens
  const cleaned = barcode.replace(/[\s-]/g, '');

  // Check length (EAN-13 is 13 digits, but we allow 8-20 characters)
  if (cleaned.length < 8 || cleaned.length > 20) {
    return false;
  }

  // Check if all characters are digits
  return /^\d+$/.test(cleaned);
};

/**
 * Format barcode for display
 * @param {string} barcode - Barcode to format
 * @returns {string} Formatted barcode
 */
export const formatBarcode = (barcode) => {
  if (!barcode) return '';
  return barcode.replace(/[\s-]/g, '');
};

