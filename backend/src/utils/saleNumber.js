/**
 * Generate unique sale number
 * Format: SAL-YYYYMMDD-XXXXX (e.g., SAL-20241125-00001)
 */
export const generateSaleNumber = async (prisma) => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const prefix = `SAL-${dateStr}-`;

  // Find the last sale number for today
  const lastSale = await prisma.sale.findFirst({
    where: {
      saleNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      saleNumber: 'desc',
    },
  });

  let sequence = 1;
  if (lastSale) {
    const lastSequence = parseInt(lastSale.saleNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  const sequenceStr = sequence.toString().padStart(5, '0');
  return `${prefix}${sequenceStr}`;
};

