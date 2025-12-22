import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSales } from '../../hooks/useSales';
import { HiDocumentText, HiPrinter } from 'react-icons/hi2';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';

const CustomerPurchaseHistory = ({ customerId, onViewInvoice }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, error } = useSales({
    customerId,
    page,
    limit: 10,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: 'COMPLETED',
  });

  const sales = data?.data?.sales || [];
  const pagination = data?.data?.pagination || {};

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

  const getStatusLabel = (status) => {
    const labels = {
      COMPLETED: t('sales.statusLabels.COMPLETED'),
      REFUNDED: t('sales.statusLabels.REFUNDED'),
      PARTIALLY_REFUNDED: t('sales.statusLabels.PARTIALLY_REFUNDED'),
      CANCELLED: t('sales.statusLabels.CANCELLED'),
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      COMPLETED: 'bg-green-100 text-green-800',
      REFUNDED: 'bg-red-100 text-red-800',
      PARTIALLY_REFUNDED: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {t('errors.loadSales')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('customers.startDate')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('customers.endDate')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {(startDate || endDate) && (
          <div className="mt-2">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {t('customers.clearFilters')}
            </button>
          </div>
        )}
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customers.receiptNumber')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customers.date')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('sales.branch')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customers.payment')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customers.status')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('customers.amount')}</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('customers.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    {t('customers.noSales')}
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{sale.saleNumber}</div>
                      {sale.invoiceNumber && (
                        <div className="text-xs text-gray-500">{t('customers.invoiceNumber')} {sale.invoiceNumber}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(sale.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.branch?.name || '-'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {sale.paymentMethod === 'CASH' ? t('sales.paymentMethodLabels.CASH') :
                         sale.paymentMethod === 'CARD' ? t('sales.paymentMethodLabels.CARD') :
                         sale.paymentMethod === 'CREDIT' ? t('sales.paymentMethodLabels.CREDIT') :
                         sale.paymentMethod === 'MIXED' ? t('sales.paymentMethodLabels.MIXED') : sale.paymentMethod}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                        {getStatusLabel(sale.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(parseFloat(sale.total), getSaleCurrency(sale))}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => onViewInvoice(sale.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                        title={t('customers.viewInvoice')}
                      >
                        <HiDocumentText className="w-4 h-4" />
                        <span>{t('customers.invoice')}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              {t('customers.purchaseHistoryPagination', { total: pagination.total, page: pagination.page, totalPages: pagination.totalPages })}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('common.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPurchaseHistory;

