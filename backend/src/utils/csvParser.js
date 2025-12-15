import { ApiError } from './ApiError.js';

/**
 * Parse CSV file content to product data
 * Expected CSV format:
 * name,description,barcode,sku,categoryId,price,costPrice,isActive
 */
export const parseCSV = (csvContent) => {
  try {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new ApiError(400, 'CSV file must contain at least a header and one data row');
    }

    // Parse header
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    
    // Required headers
    const requiredHeaders = ['name', 'price'];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new ApiError(400, `Missing required headers: ${missingHeaders.join(', ')}`);
    }

    // Parse data rows
    const products = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = line.split(',').map((v) => v.trim());
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const product = {};
      headers.forEach((header, index) => {
        const value = values[index];
        
        switch (header) {
          case 'name':
            product.name = value;
            break;
          case 'description':
            product.description = value || null;
            break;
          case 'barcode':
            product.barcode = value || null;
            break;
          case 'sku':
            product.sku = value || null;
            break;
          case 'categoryid':
            product.categoryId = value || null;
            break;
          case 'price':
            const price = parseFloat(value);
            if (isNaN(price) || price < 0) {
              errors.push(`Row ${i + 1}: Invalid price "${value}"`);
              return;
            }
            product.price = price;
            break;
          case 'costprice':
            const costPrice = value ? parseFloat(value) : null;
            if (value && (isNaN(costPrice) || costPrice < 0)) {
              errors.push(`Row ${i + 1}: Invalid cost price "${value}"`);
              return;
            }
            product.costPrice = costPrice;
            break;
          case 'isactive':
            product.isActive = value.toLowerCase() === 'true' || value === '1';
            break;
        }
      });

      // Validate required fields
      if (!product.name || !product.price) {
        errors.push(`Row ${i + 1}: Missing required fields (name, price)`);
        continue;
      }

      products.push(product);
    }

    if (errors.length > 0 && products.length === 0) {
      throw new ApiError(400, `CSV parsing errors:\n${errors.join('\n')}`);
    }

    return {
      products,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, `Failed to parse CSV: ${error.message}`);
  }
};

/**
 * Generate CSV template
 */
export const generateCSVTemplate = () => {
  const headers = [
    'name',
    'description',
    'barcode',
    'sku',
    'categoryId',
    'price',
    'costPrice',
    'isActive',
  ];

  const exampleRow = [
    'Sample Product',
    'Product description',
    '1234567890123',
    'SKU-001',
    '',
    '99.99',
    '50.00',
    'true',
  ];

  return [headers.join(','), exampleRow.join(',')].join('\n');
};

