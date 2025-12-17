import { useSale } from '../../hooks/useSales';
import { HiPrinter } from 'react-icons/hi2';
import { HiDownload } from 'react-icons/hi';
import Button from '../common/Button';

const InvoiceView = ({ saleId, onClose }) => {
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
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Fatura - ${sale?.saleNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
              .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .invoice-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .invoice-items th, .invoice-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .invoice-items th { background-color: #f2f2f2; }
              .invoice-total { text-align: right; margin-top: 20px; }
              .invoice-footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            ${document.getElementById('invoice-content')?.innerHTML || ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Fatura yükleniyor...</div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Fatura yüklenirken bir hata oluştu
      </div>
    );
  }

  const subtotal = sale.items?.reduce((sum, item) => sum + parseFloat(item.total), 0) || 0;
  const totalDiscount = parseFloat(sale.discount || 0);
  const total = parseFloat(sale.total);

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={handlePrint} variant="primary" size="sm">
          <HiPrinter className="w-4 h-4 mr-2" />
          Yazdır
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <HiDownload className="w-4 h-4 mr-2" />
          İndir
        </Button>
      </div>

      {/* Invoice Content */}
      <div id="invoice-content" className="bg-white border-2 border-gray-300 rounded-lg p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VIDALITA RETAIL</h1>
          <p className="text-gray-600">Satış Faturası</p>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Fatura Bilgileri</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Fiş No:</strong> {sale.saleNumber}</p>
              {sale.invoiceNumber && (
                <p><strong>Fatura No:</strong> {sale.invoiceNumber}</p>
              )}
              <p><strong>Tarih:</strong> {formatDate(sale.createdAt)}</p>
              <p><strong>Şube:</strong> {sale.branch?.name || '-'}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Müşteri Bilgileri</h3>
            <div className="space-y-1 text-sm text-gray-600">
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
        <div className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Ürün</th>
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-900">Miktar</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">Birim Fiyat</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">İndirim</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="font-medium text-gray-900">{item.product?.name || '-'}</div>
                    {item.product?.barcode && (
                      <div className="text-xs text-gray-500 font-mono">Barkod: {item.product.barcode}</div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-gray-900">
                    {formatCurrency(parseFloat(item.unitPrice))}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-gray-900">
                    {parseFloat(item.discount || 0) > 0 ? formatCurrency(parseFloat(item.discount)) : '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                    {formatCurrency(parseFloat(item.total))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ara Toplam:</span>
              <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">İndirim:</span>
                <span className="font-medium text-red-600">-{formatCurrency(totalDiscount)}</span>
              </div>
            )}
            {parseFloat(sale.tax || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">KDV:</span>
                <span className="font-medium text-gray-900">{formatCurrency(parseFloat(sale.tax))}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-2">
              <span className="text-gray-900">TOPLAM:</span>
              <span className="text-gray-900">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-t border-gray-300 pt-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Ödeme Yöntemi:</span>
              <span className="ml-2 font-medium text-gray-900">
                {sale.paymentMethod === 'CASH' ? 'Nakit' :
                 sale.paymentMethod === 'CARD' ? 'Kredi Kartı' :
                 sale.paymentMethod === 'CREDIT' ? 'Veresiye' :
                 sale.paymentMethod === 'MIXED' ? 'Karma' : sale.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Ödenen Tutar:</span>
              <span className="ml-2 font-medium text-gray-900">
                {formatCurrency(parseFloat(sale.paidAmount || sale.total))}
              </span>
            </div>
            {parseFloat(sale.changeAmount || 0) > 0 && (
              <div>
                <span className="text-gray-600">Para Üstü:</span>
                <span className="ml-2 font-medium text-green-600">
                  {formatCurrency(parseFloat(sale.changeAmount))}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Kasiyer:</span>
              <span className="ml-2 font-medium text-gray-900">
                {sale.cashier?.fullName || sale.cashier?.username || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
          <p>Teşekkür ederiz!</p>
          <p className="mt-1">Bu belge elektronik faturadır.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          #invoice-content,
          #invoice-content * {
            visibility: visible;
          }
          
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceView;

