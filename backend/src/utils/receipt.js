/**
 * Receipt generation utility
 * Formats sale data for printing (ESC/POS compatible)
 */
export const generateReceipt = (sale) => {
  const lines = [];

  // Header
  lines.push('='.repeat(42));
  lines.push('        VIDALITA RETAIL MANAGER');
  lines.push('='.repeat(42));
  lines.push(`Şube: ${sale.branch.name} (${sale.branch.code})`);
  lines.push(`Fiş No: ${sale.saleNumber}`);
  lines.push(`Tarih: ${new Date(sale.createdAt).toLocaleString('tr-TR')}`);
  if (sale.customer) {
    lines.push(`Müşteri: ${sale.customer.name}`);
  }
  lines.push(`Kasiyer: ${sale.cashier.fullName}`);
  lines.push('-'.repeat(42));

  // Items
  lines.push('ÜRÜN ADI              MIKTAR  FİYAT');
  lines.push('-'.repeat(42));
  
  sale.items.forEach((item) => {
    const name = item.product.name.length > 20 
      ? item.product.name.substring(0, 20) 
      : item.product.name;
    const quantity = item.quantity.toString().padStart(3);
    const price = parseFloat(item.unitPrice).toFixed(2).padStart(8);
    const total = parseFloat(item.total).toFixed(2).padStart(10);
    
    lines.push(`${name.padEnd(20)} ${quantity}x ${price}`);
    if (item.discount > 0) {
      lines.push(`  İndirim: -${parseFloat(item.discount).toFixed(2)}`);
    }
    lines.push(`  Toplam: ${total}`);
  });

  lines.push('-'.repeat(42));

  // Totals
  lines.push(`Ara Toplam:     ${parseFloat(sale.subtotal).toFixed(2).padStart(10)}`);
  if (sale.discount > 0) {
    lines.push(`İndirim:        ${parseFloat(sale.discount).toFixed(2).padStart(10)}`);
  }
  if (sale.tax > 0) {
    lines.push(`KDV:            ${parseFloat(sale.tax).toFixed(2).padStart(10)}`);
  }
  lines.push('='.repeat(42));
  lines.push(`TOPLAM:         ${parseFloat(sale.total).toFixed(2).padStart(10)}`);
  lines.push('='.repeat(42));

  // Payment
  lines.push(`Ödeme:          ${sale.paymentMethod}`);
  lines.push(`Ödenen:         ${parseFloat(sale.paidAmount).toFixed(2).padStart(10)}`);
  if (sale.changeAmount > 0) {
    lines.push(`Para Üstü:      ${parseFloat(sale.changeAmount).toFixed(2).padStart(10)}`);
  }

  lines.push('='.repeat(42));
  lines.push('        Teşekkür ederiz!');
  lines.push('='.repeat(42));

  return lines.join('\n');
};

