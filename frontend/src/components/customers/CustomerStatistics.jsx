import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomerStatistics } from '../../hooks/useCustomers';
import StatCard from '../dashboard/StatCard';
import { formatCurrency } from '../../utils/currency';

const CustomerStatistics = ({ customerId }) => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const { data, isLoading, error, refetch } = useCustomerStatistics(customerId, dateRange);
  const statistics = data?.data;
  
  // Default to UZS for customer statistics (aggregates multiple currencies)
  const statsCurrency = 'UZS';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('customerStatistics.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {t('customerStatistics.loadError')}
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('customerStatistics.startDate')}</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="input"
            />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('customerStatistics.endDate')}</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="input"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {t('customerStatistics.clear')}
            </button>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              {t('customerStatistics.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={t('customerStatistics.totalSales')}
          value={statistics.summary.totalSales}
          subtitle={formatCurrency(statistics.summary.totalRevenue, statsCurrency)}
          color="primary"
        />
        <StatCard
          title={t('customerStatistics.totalRevenue')}
          value={formatCurrency(statistics.summary.totalRevenue, statsCurrency)}
          subtitle={`${t('customerStatistics.averageSale')}: ${formatCurrency(statistics.summary.averageSale, statsCurrency)}`}
          color="green"
        />
        <StatCard
          title={t('customerStatistics.totalItems')}
          value={statistics.summary.totalItems}
          subtitle={`${t('customerStatistics.totalDiscount')}: ${formatCurrency(statistics.summary.totalDiscount, statsCurrency)}`}
          color="gray"
        />
        <StatCard
          title={t('customerStatistics.currentDebt')}
          value={formatCurrency(statistics.summary.currentDebt, statsCurrency)}
          color={statistics.summary.currentDebt > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Monthly Breakdown */}
      {statistics.monthlyBreakdown && statistics.monthlyBreakdown.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('customerStatistics.monthlyBreakdown')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.month')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.salesCount')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.revenue')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.items')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.monthlyBreakdown.map((month, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month.monthName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                      {month.sales}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(month.revenue, statsCurrency)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                      {month.items}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Products */}
      {statistics.topProducts && statistics.topProducts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('customerStatistics.topProducts')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.product')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.quantity')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.revenue')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.sales')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.productName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                      {product.quantity}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(product.revenue, statsCurrency)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                      {product.sales}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Branch Breakdown */}
      {statistics.branchBreakdown && statistics.branchBreakdown.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('customerStatistics.branchBreakdown')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statistics.branchBreakdown.map((branch, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{branch.branchName}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('customerStatistics.salesCount')}:</span>
                    <span className="font-medium text-gray-900">{branch.sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('customerStatistics.revenue')}:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(branch.revenue, statsCurrency)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sales */}
      {statistics.recentSales && statistics.recentSales.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('customerStatistics.recentSales')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.receiptNumber')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.date')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.branch')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.amount')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('customerStatistics.itemsCount')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                      {sale.saleNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(sale.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{sale.branch}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(sale.total, statsCurrency)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                      {sale.items}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerStatistics;

