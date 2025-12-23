import { useSale } from '../../hooks/useSales';
import { useTranslation } from 'react-i18next';
import { HiPrinter } from 'react-icons/hi2';
import { HiDownload } from 'react-icons/hi';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';

const InvoiceView = ({ saleId, onClose }) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useSale(saleId);
  const sale = data?.data;

  // Get the most common currency from sale items, or default to UZS
  const getSaleCurrency = (sale) => {
    if (!sale?.items || sale.items.length === 0) return 'UZS';
    const currencies = sale.items
      .map(item => item.product?.currency || 'UZS')
      .filter(Boolean);
    if (currencies.length === 0) return 'UZS';
    const currencyCounts = {};
    currencies.forEach(curr => {
      currencyCounts[curr] = (currencyCounts[curr] || 0) + 1;
    });
    return Object.keys(currencyCounts).reduce((a, b) => 
      currencyCounts[a] > currencyCounts[b] ? a : b
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    // Print öncesi scroll'u en üste al ve tüm içeriği görünür yap
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Modal içindeki scroll'u da sıfırla
    const invoiceContent = document.getElementById('invoice-content');
    if (invoiceContent) {
      invoiceContent.scrollTop = 0;
      // Tüm parent container'ların scroll'unu sıfırla
      let parent = invoiceContent.parentElement;
      while (parent) {
        if (parent.scrollTop !== undefined) {
          parent.scrollTop = 0;
        }
        parent = parent.parentElement;
      }
    }
    
    // Kısa bir gecikme sonrası print (DOM güncellemesi için)
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownload = () => {
    // Trigger print which will show both copies
    handlePrint();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {t('invoice.loadError')}
      </div>
    );
  }

  const subtotal = sale.items?.reduce((sum, item) => sum + parseFloat(item.total), 0) || 0;
  const totalDiscount = parseFloat(sale.discount || 0);
  const total = parseFloat(sale.total);
  const saleCurrency = sale ? getSaleCurrency(sale) : 'UZS';

  // Invoice Content Component
  const InvoiceContent = ({ copyType = 'customer' }) => (
    <div className={`invoice-copy invoice-${copyType} bg-white border-2 border-gray-300 rounded-lg p-4 print:p-3`}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-3 mb-3 print:pb-2 print:mb-2">
        <div className="mb-2 print:mb-1">
          <img 
            src="/uploads/logo/vidalita_logo.webp" 
            alt="Vidalita" 
            className="h-12 mx-auto object-contain print:h-10"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'block';
              }
            }}
          />
          <h1 className="text-xl font-bold text-gray-900 mb-1 print:text-base hidden">Vidalita</h1>
        </div>
        <p className="text-sm text-gray-600 print:text-xs">{t('invoice.title')}</p>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-4 mb-3 print:gap-2 print:mb-2 text-xs print:text-[10px]">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 print:mb-0.5 print:text-[10px]">{t('invoice.invoiceInfo')}</h3>
          <div className="space-y-0.5 text-gray-600 print:space-y-0">
            <p><strong>{t('invoice.saleNumber')}:</strong> {sale.saleNumber}</p>
            {sale.invoiceNumber && (
              <p><strong>{t('invoice.invoiceNo')}:</strong> {sale.invoiceNumber}</p>
            )}
            <p><strong>{t('invoice.date')}:</strong> {formatDate(sale.createdAt)}</p>
            <p><strong>{t('invoice.branch')}:</strong> {sale.branch?.name || '-'}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 print:mb-0.5 print:text-[10px]">{t('invoice.customerInfo')}</h3>
          <div className="space-y-0.5 text-gray-600 print:space-y-0">
            {sale.customer ? (
              <>
                <p><strong>{t('invoice.name')}:</strong> {sale.customer.name}</p>
                {sale.customer.phone && (
                  <p><strong>{t('invoice.phone')}:</strong> {sale.customer.phone}</p>
                )}
                {sale.customer.email && (
                  <p><strong>{t('invoice.email')}:</strong> {sale.customer.email}</p>
                )}
              </>
            ) : (
              <p className="text-gray-500">{t('invoice.anonymousCustomer')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-3 print:mb-2">
        <table className="w-full border-collapse text-xs print:text-[9px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-900 print:px-1 print:py-0.5">{t('invoice.product')}</th>
              <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-900 print:px-1 print:py-0.5">{t('invoice.quantity')}</th>
              <th className="border border-gray-300 px-2 py-1 text-right font-semibold text-gray-900 print:px-1 print:py-0.5">{t('invoice.unitPrice')}</th>
              <th className="border border-gray-300 px-2 py-1 text-right font-semibold text-gray-900 print:px-1 print:py-0.5">{t('invoice.total')}</th>
            </tr>
          </thead>
          <tbody>
            {sale.items?.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 print:px-1 print:py-0.5">
                  <div className="font-medium text-gray-900">{item.product?.name || '-'}</div>
                  {item.product?.barcode && (
                    <div className="text-[10px] text-gray-500 font-mono print:text-[8px]">{t('invoice.barcode')}: {item.product.barcode}</div>
                  )}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center text-gray-900 print:px-1 print:py-0.5">
                  {item.quantity}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right text-gray-900 print:px-1 print:py-0.5">
                  {formatCurrency(parseFloat(item.unitPrice), item.product?.currency || saleCurrency)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right font-semibold text-gray-900 print:px-1 print:py-0.5">
                  {formatCurrency(parseFloat(item.total), item.product?.currency || saleCurrency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-3 print:mb-2">
        <div className="w-64 space-y-1 print:w-48 print:space-y-0.5">
          <div className="flex justify-between text-xs print:text-[10px]">
            <span className="text-gray-600">{t('invoice.subtotal')}:</span>
            <span className="font-medium text-gray-900">{formatCurrency(subtotal, saleCurrency)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-xs print:text-[10px]">
              <span className="text-gray-600">{t('invoice.discount')}:</span>
              <span className="font-medium text-red-600">-{formatCurrency(totalDiscount, saleCurrency)}</span>
            </div>
          )}
          {parseFloat(sale.tax || 0) > 0 && (
            <div className="flex justify-between text-xs print:text-[10px]">
              <span className="text-gray-600">{t('invoice.tax')}:</span>
              <span className="font-medium text-gray-900">{formatCurrency(parseFloat(sale.tax), saleCurrency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold border-t-2 border-gray-300 pt-1 print:text-xs print:pt-0.5">
            <span className="text-gray-900">{t('invoice.total')}:</span>
            <span className="text-gray-900">{formatCurrency(total, saleCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="border-t border-gray-300 pt-2 mb-2 print:pt-1 print:mb-1">
        <div className="grid grid-cols-2 gap-2 text-xs print:text-[9px]">
          <div>
            <span className="text-gray-600">{t('invoice.payment')}:</span>
            <span className="ml-1 font-medium text-gray-900">
              {sale.paymentMethod === 'CASH' ? t('pos.cash') :
               sale.paymentMethod === 'CARD' ? t('pos.card') :
               sale.paymentMethod === 'CREDIT' ? t('pos.credit') :
               sale.paymentMethod === 'MIXED' ? t('pos.mixed') : sale.paymentMethod}
            </span>
          </div>
          <div>
            <span className="text-gray-600">{t('invoice.paid')}:</span>
            <span className="ml-1 font-medium text-gray-900">
              {formatCurrency(parseFloat(sale.paidAmount || sale.total), saleCurrency)}
            </span>
          </div>
          {parseFloat(sale.changeAmount || 0) > 0 && (
            <div>
              <span className="text-gray-600">{t('invoice.change')}:</span>
              <span className="ml-1 font-medium text-green-600">
                {formatCurrency(parseFloat(sale.changeAmount), saleCurrency)}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-600">{t('invoice.cashier')}:</span>
            <span className="ml-1 font-medium text-gray-900">
              {sale.cashier?.fullName || sale.cashier?.username || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-2 text-center text-[10px] text-gray-500 print:pt-1 print:text-[8px]">
        <p>{t('invoice.thankYou')}</p>
        <p className="mt-0.5 print:mt-0">{t('invoice.electronicDocument')}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={handlePrint} variant="primary" size="sm">
          <HiPrinter className="w-4 h-4 mr-2" />
          {t('invoice.print')}
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <HiDownload className="w-4 h-4 mr-2" />
          {t('invoice.download')}
        </Button>
      </div>

      {/* Invoice Content - Two Copies */}
      <div id="invoice-content" className="invoice-container max-w-4xl mx-auto print:max-w-full print:mx-0">
        {/* Screen View - Show both copies stacked */}
        <div className="space-y-4 print:space-y-2">
          <InvoiceContent copyType="customer" />
          <InvoiceContent copyType="cashier" />
        </div>
      </div>
      {/* Print Styles */}
      <style>{`
        @media print {
          /* Sayfa ayarı */
          @page {
            size: A4;
            margin: 10mm;
          }

          /* TÜM UYGULAMAYI GİZLE */
          body > * {
            display: none !important;
          }

          /* Root'u göster */
          body > #root {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Root içindeki her şeyi gizle */
          #root > * {
            display: none !important;
          }

          /* Modal container'larını gizle ve overflow'ları kaldır */
          .fixed,
          [class*="fixed"],
          [class*="overflow-y-auto"],
          [class*="overflow-y"],
          [class*="max-h"] {
            position: static !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }

          /* Modal backdrop ve overlay'leri gizle */
          [class*="bg-black"],
          [class*="bg-opacity"],
          [class*="backdrop"] {
            display: none !important;
          }

          /* Scroll pozisyonunu sıfırla */
          html,
          body {
            overflow: visible !important;
            height: auto !important;
            position: static !important;
          }

          /* SADECE FATURAYI GÖSTER - en yüksek öncelik */
          #invoice-content {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: auto !important;
            overflow: visible !important;
            max-height: none !important;
          }

          /* Fatura içindeki tüm elementleri göster */
          #invoice-content * {
            display: revert !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }

          /* Tablo ve inline elementler için düzeltme */
          #invoice-content table {
            display: table !important;
          }

          #invoice-content tr {
            display: table-row !important;
          }

          #invoice-content td,
          #invoice-content th {
            display: table-cell !important;
          }

          #invoice-content img {
            display: block !important;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }

          .invoice-container {
            max-width: 100% !important;
            margin: 0 !important;
          }

          .invoice-copy {
            page-break-inside: avoid;
            height: auto !important;
            min-height: calc(50% - 5mm);
            display: block !important;
            overflow: visible !important;
          }

          .invoice-copy:first-child {
            border-bottom: 2px dashed #999;
            margin-bottom: 5mm;
            padding-bottom: 5mm;
          }
          
          .print\\:max-w-full {
            max-width: 100% !important;
          }
          
          .print\\:mx-0 {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          
          .print\\:p-3 {
            padding: 0.75rem !important;
          }
          
          .print\\:mb-2 {
            margin-bottom: 0.5rem !important;
          }
          
          .print\\:pb-2 {
            padding-bottom: 0.5rem !important;
          }
          
          .print\\:text-base {
            font-size: 1rem !important;
          }
          
          .print\\:text-xs {
            font-size: 0.75rem !important;
          }
          
          .print\\:text-\\[10px\\] {
            font-size: 10px !important;
          }
          
          .print\\:text-\\[9px\\] {
            font-size: 9px !important;
          }
          
          .print\\:text-\\[8px\\] {
            font-size: 8px !important;
          }
          
          .print\\:px-1 {
            padding-left: 0.25rem !important;
            padding-right: 0.25rem !important;
          }
          
          .print\\:py-0\\.5 {
            padding-top: 0.125rem !important;
            padding-bottom: 0.125rem !important;
          }
          
          .print\\:mb-0\\.5 {
            margin-bottom: 0.125rem !important;
          }
          
          .print\\:space-y-0 > * + * {
            margin-top: 0 !important;
          }
          
          .print\\:space-y-2 > * + * {
            margin-top: 0.5rem !important;
          }
          
          .print\\:pt-0\\.5 {
            padding-top: 0.125rem !important;
          }
          
          .print\\:pt-1 {
            padding-top: 0.25rem !important;
          }
          
          .print\\:mb-1 {
            margin-bottom: 0.25rem !important;
          }
          
          .print\\:mt-0 {
            margin-top: 0 !important;
          }
        }
        
        @media screen {
          .invoice-copy {
            min-height: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceView;

