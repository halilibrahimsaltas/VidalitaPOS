import { useRef } from 'react';
import { useSale } from '../../hooks/useSales';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { HiPrinter } from 'react-icons/hi2';
import { HiDownload } from 'react-icons/hi';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';
import { getLogoUrl } from '../../config/logo';
import InvoicePrint from './InvoicePrint';

const InvoiceView = ({ saleId, onClose }) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useSale(saleId);
  const sale = data?.data;
  const printRef = useRef();

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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: sale?.invoiceNumber || sale?.saleNumber || 'invoice',
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    `
  });

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

  const saleCurrency = sale ? getSaleCurrency(sale) : 'UZS';

  // Screen preview component (same as print but visible)
  const InvoiceContent = ({ copyType = 'customer' }) => {
    const subtotal = sale.items?.reduce((sum, item) => sum + parseFloat(item.total), 0) || 0;
    const totalDiscount = parseFloat(sale.discount || 0);
    const total = parseFloat(sale.total);

    return (
      <div className={`invoice-copy invoice-${copyType} bg-white border-2 border-gray-300 rounded-lg p-4`}>
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-3 mb-3">
          <div className="mb-2">
            <img 
              src={getLogoUrl('invoice')} 
              alt="Vidalita" 
              className="h-12 mx-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'block';
                }
              }}
            />
            <h1 className="text-xl font-bold text-gray-900 mb-1 hidden">Vidalita</h1>
          </div>
          <p className="text-sm text-gray-600">{t('invoice.title')}</p>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('invoice.invoiceInfo')}</h3>
            <div className="space-y-0.5 text-gray-600">
              <p><strong>{t('invoice.saleNumber')}:</strong> {sale.saleNumber}</p>
              {sale.invoiceNumber && (
                <p><strong>{t('invoice.invoiceNo')}:</strong> {sale.invoiceNumber}</p>
              )}
              <p><strong>{t('invoice.date')}:</strong> {formatDate(sale.createdAt)}</p>
              <p><strong>{t('invoice.branch')}:</strong> {sale.branch?.name || '-'}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('invoice.customerInfo')}</h3>
            <div className="space-y-0.5 text-gray-600">
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
        <div className="mb-3">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-900">{t('invoice.product')}</th>
                <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-900">{t('invoice.quantity')}</th>
                <th className="border border-gray-300 px-2 py-1 text-right font-semibold text-gray-900">{t('invoice.unitPrice')}</th>
                <th className="border border-gray-300 px-2 py-1 text-right font-semibold text-gray-900">{t('invoice.total')}</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-1">
                    <div className="font-medium text-gray-900">{item.product?.name || '-'}</div>
                    {item.product?.barcode && (
                      <div className="text-[10px] text-gray-500 font-mono">{t('invoice.barcode')}: {item.product.barcode}</div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right text-gray-900">
                    {formatCurrency(parseFloat(item.unitPrice), item.product?.currency || saleCurrency)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right font-semibold text-gray-900">
                    {formatCurrency(parseFloat(item.total), item.product?.currency || saleCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-3">
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">{t('invoice.subtotal')}:</span>
              <span className="font-medium text-gray-900">{formatCurrency(subtotal, saleCurrency)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{t('invoice.discount')}:</span>
                <span className="font-medium text-red-600">-{formatCurrency(totalDiscount, saleCurrency)}</span>
              </div>
            )}
            {parseFloat(sale.tax || 0) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{t('invoice.tax')}:</span>
                <span className="font-medium text-gray-900">{formatCurrency(parseFloat(sale.tax), saleCurrency)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t-2 border-gray-300 pt-1">
              <span className="text-gray-900">{t('invoice.total')}:</span>
              <span className="text-gray-900">{formatCurrency(total, saleCurrency)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-t border-gray-300 pt-2 mb-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
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
        <div className="border-t border-gray-300 pt-2 text-center text-[10px] text-gray-500">
          <p>{t('invoice.thankYou')}</p>
          <p className="mt-0.5">{t('invoice.electronicDocument')}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button onClick={handlePrint} variant="primary" size="sm">
          <HiPrinter className="w-4 h-4 mr-2" />
          {t('invoice.print')}
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <HiDownload className="w-4 h-4 mr-2" />
          {t('invoice.download')}
        </Button>
      </div>

      {/* Hidden print component */}
      <div className="hidden">
        <InvoicePrint
          ref={printRef}
          sale={sale}
          t={t}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          saleCurrency={saleCurrency}
        />
      </div>

      {/* Screen View - Show both copies stacked */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          <InvoiceContent copyType="customer" />
          <InvoiceContent copyType="cashier" />
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
