import { useSale } from '../../hooks/useSales';
import { useTranslation } from 'react-i18next';
import { HiPrinter } from 'react-icons/hi2';
import { HiDownload } from 'react-icons/hi';
import Button from '../common/Button';

const InvoiceView = ({ saleId, onClose }) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useSale(saleId);
  const sale = data?.data;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount || 0);
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
    window.print();
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

  // Invoice Content Component
  const InvoiceContent = ({ copyType = 'customer' }) => (
    <div className={`invoice-copy invoice-${copyType} bg-white border-2 border-gray-300 rounded-lg p-4 print:p-3`}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-3 mb-3 print:pb-2 print:mb-2">
        <h1 className="text-xl font-bold text-gray-900 mb-1 print:text-base">Vidalita</h1>
        <p className="text-sm text-gray-600 print:text-xs">Satış Faturası</p>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-4 mb-3 print:gap-2 print:mb-2 text-xs print:text-[10px]">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 print:mb-0.5 print:text-[10px]">Fatura Bilgileri</h3>
          <div className="space-y-0.5 text-gray-600 print:space-y-0">
            <p><strong>Fiş No:</strong> {sale.saleNumber}</p>
            {sale.invoiceNumber && (
              <p><strong>Fatura No:</strong> {sale.invoiceNumber}</p>
            )}
            <p><strong>Tarih:</strong> {formatDate(sale.createdAt)}</p>
            <p><strong>Şube:</strong> {sale.branch?.name || '-'}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 print:mb-0.5 print:text-[10px]">Müşteri Bilgileri</h3>
          <div className="space-y-0.5 text-gray-600 print:space-y-0">
            {sale.customer ? (
              <>
                <p><strong>Ad:</strong> {sale.customer.name}</p>
                {sale.customer.phone && (
                  <p><strong>Telefon:</strong> {sale.customer.phone}</p>
                )}
                {sale.customer.email && (
                  <p><strong>Email:</strong> {sale.customer.email}</p>
                )}
              </>
            ) : (
              <p className="text-gray-500">Anonim Müşteri</p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-3 print:mb-2">
        <table className="w-full border-collapse text-xs print:text-[9px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-900 print:px-1 print:py-0.5">Ürün</th>
              <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-900 print:px-1 print:py-0.5">Miktar</th>
              <th className="border border-gray-300 px-2 py-1 text-right font-semibold text-gray-900 print:px-1 print:py-0.5">Birim Fiyat</th>
              <th className="border border-gray-300 px-2 py-1 text-right font-semibold text-gray-900 print:px-1 print:py-0.5">Toplam</th>
            </tr>
          </thead>
          <tbody>
            {sale.items?.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 print:px-1 print:py-0.5">
                  <div className="font-medium text-gray-900">{item.product?.name || '-'}</div>
                  {item.product?.barcode && (
                    <div className="text-[10px] text-gray-500 font-mono print:text-[8px]">Barkod: {item.product.barcode}</div>
                  )}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center text-gray-900 print:px-1 print:py-0.5">
                  {item.quantity}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right text-gray-900 print:px-1 print:py-0.5">
                  {formatCurrency(parseFloat(item.unitPrice))}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right font-semibold text-gray-900 print:px-1 print:py-0.5">
                  {formatCurrency(parseFloat(item.total))}
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
            <span className="text-gray-600">Ara Toplam:</span>
            <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-xs print:text-[10px]">
              <span className="text-gray-600">İndirim:</span>
              <span className="font-medium text-red-600">-{formatCurrency(totalDiscount)}</span>
            </div>
          )}
          {parseFloat(sale.tax || 0) > 0 && (
            <div className="flex justify-between text-xs print:text-[10px]">
              <span className="text-gray-600">KDV:</span>
              <span className="font-medium text-gray-900">{formatCurrency(parseFloat(sale.tax))}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold border-t-2 border-gray-300 pt-1 print:text-xs print:pt-0.5">
            <span className="text-gray-900">TOPLAM:</span>
            <span className="text-gray-900">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="border-t border-gray-300 pt-2 mb-2 print:pt-1 print:mb-1">
        <div className="grid grid-cols-2 gap-2 text-xs print:text-[9px]">
          <div>
            <span className="text-gray-600">Ödeme:</span>
            <span className="ml-1 font-medium text-gray-900">
              {sale.paymentMethod === 'CASH' ? 'Nakit' :
               sale.paymentMethod === 'CARD' ? 'Kart' :
               sale.paymentMethod === 'CREDIT' ? 'Veresiye' :
               sale.paymentMethod === 'MIXED' ? 'Karma' : sale.paymentMethod}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Ödenen:</span>
            <span className="ml-1 font-medium text-gray-900">
              {formatCurrency(parseFloat(sale.paidAmount || sale.total))}
            </span>
          </div>
          {parseFloat(sale.changeAmount || 0) > 0 && (
            <div>
              <span className="text-gray-600">Para Üstü:</span>
              <span className="ml-1 font-medium text-green-600">
                {formatCurrency(parseFloat(sale.changeAmount))}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-600">Kasiyer:</span>
            <span className="ml-1 font-medium text-gray-900">
              {sale.cashier?.fullName || sale.cashier?.username || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-2 text-center text-[10px] text-gray-500 print:pt-1 print:text-[8px]">
        <p>Teşekkür ederiz!</p>
        <p className="mt-0.5 print:mt-0">Bu belge elektronik faturadır.</p>
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
        <div className="space-y-4 print:space-y-0 print:m-0 print:p-0">
          <InvoiceContent copyType="customer" />
          <InvoiceContent copyType="cashier" />
        </div>
      </div>
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0.2cm;
          }
          
          html {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            overflow: visible !important;
            position: relative !important;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body > *:not(.invoice-container) {
            display: none !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          .invoice-container,
          .invoice-container * {
            visibility: visible !important;
          }
          
          .invoice-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            transform: none !important;
          }
          
          .invoice-container > div {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.2cm !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .invoice-copy {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 100% !important;
            margin: 0 !important;
            margin-top: 0 !important;
            padding: 0.3cm !important;
            border: 1px solid #ccc !important;
          }
          
          .invoice-copy:first-child {
            margin-top: 0 !important;
            padding-top: 0.3cm !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:max-w-full {
            max-width: 100% !important;
          }
          
          .print\\:mx-0 {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          
          .print\\:m-0 {
            margin: 0 !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:space-y-0 > * + * {
            margin-top: 0.2cm !important;
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

