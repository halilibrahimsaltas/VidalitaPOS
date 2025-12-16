import { useState } from 'react';
import { useCustomerStatistics } from '../../hooks/useCustomers';
import StatCard from '../dashboard/StatCard';

const CustomerStatistics = ({ customerId }) => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const { data, isLoading, error, refetch } = useCustomerStatistics(customerId, dateRange);
  const statistics = data?.data;

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
        <div className="text-gray-500">İstatistikler yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        İstatistikler yüklenirken bir hata oluştu
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="input"
            />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
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
              Temizle
            </button>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Yenile
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Toplam Satış"
          value={statistics.summary.totalSales}
          subtitle={formatCurrency(statistics.summary.totalRevenue)}
          color="primary"
        />
        <StatCard
          title="Toplam Ciro"
          value={formatCurrency(statistics.summary.totalRevenue)}
          subtitle={`Ortalama: ${formatCurrency(statistics.summary.averageSale)}`}
          color="green"
        />
        <StatCard
          title="Toplam Ürün"
          value={statistics.summary.totalItems}
          subtitle={`İndirim: ${formatCurrency(statistics.summary.totalDiscount)}`}
          color="gray"
        />
        <StatCard
          title="Mevcut Borç"
          value={formatCurrency(statistics.summary.currentDebt)}
          color={statistics.summary.currentDebt > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Monthly Breakdown */}
      {statistics.monthlyBreakdown && statistics.monthlyBreakdown.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Özet</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ay</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Satış Sayısı</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ciro</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ürün Adedi</th>
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
                      {formatCurrency(month.revenue)}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">En Çok Alınan Ürünler</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Adet</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ciro</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Satış Sayısı</th>
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
                      {formatCurrency(product.revenue)}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Şube Bazında Özet</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statistics.branchBreakdown.map((branch, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{branch.branchName}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Satış Sayısı:</span>
                    <span className="font-medium text-gray-900">{branch.sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ciro:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(branch.revenue)}</span>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Satışlar</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiş No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Şube</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ürün Sayısı</th>
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
                      {formatCurrency(sale.total)}
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

