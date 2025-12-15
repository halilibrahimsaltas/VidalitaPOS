import { useState, useEffect } from 'react';
import { useCashRegisterReport } from '../../hooks/useReports';
import { useBranches } from '../../hooks/useBranches';
import Select from '../common/Select';
import Button from '../common/Button';

const CashRegisterReport = () => {
  const { data: branchesData } = useBranches({ limit: 100, isActive: true });
  const branches = branchesData?.data?.branches || [];

  const [filters, setFilters] = useState({
    branchId: '',
    period: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data, isLoading, error } = useCashRegisterReport(filters);
  const report = data?.data;

  useEffect(() => {
    // Set date based on period
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    if (filters.period === 'daily') {
      setFilters((prev) => ({
        ...prev,
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }));
    } else if (filters.period === 'weekly') {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      setFilters((prev) => ({
        ...prev,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }));
    } else if (filters.period === 'monthly') {
      const startDate = new Date(today);
      startDate.setDate(1);
      setFilters((prev) => ({
        ...prev,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }));
    }
  }, [filters.period]);

  const handlePrint = () => {
    window.print();
  };

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

  const getPaymentMethodLabel = (method) => {
    const labels = {
      CASH: 'Nakit',
      CARD: 'Kart',
      CREDIT: 'Kredi',
      MIXED: 'Karma',
    };
    return labels[method] || method;
  };

  const getPeriodLabel = (period) => {
    const labels = {
      daily: 'Günlük',
      weekly: 'Haftalık',
      monthly: 'Aylık',
    };
    return labels[period] || period;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Rapor yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Rapor yüklenirken bir hata oluştu
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Filtreler</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Periyot"
            value={filters.period}
            onChange={(e) => setFilters((prev) => ({ ...prev, period: e.target.value }))}
            options={[
              { value: 'daily', label: 'Günlük' },
              { value: 'weekly', label: 'Haftalık' },
              { value: 'monthly', label: 'Aylık' },
            ]}
          />

          <Select
            label="Şube"
            value={filters.branchId}
            onChange={(e) => setFilters((prev) => ({ ...prev, branchId: e.target.value }))}
            options={[
              { value: '', label: 'Tüm Şubeler' },
              ...branches.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-lg shadow p-6 print:shadow-none">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h2 className="text-2xl font-bold text-gray-900">
            Gün Sonu Kasa Raporu - {getPeriodLabel(filters.period)}
          </h2>
          <Button onClick={handlePrint} variant="primary">
            🖨️ Yazdır
          </Button>
        </div>

        {/* Report Header */}
        <div className="border-b pb-4 mb-6">
          <div className="text-sm text-gray-600">
            <p><strong>Tarih Aralığı:</strong> {formatDate(report.period.startDate)} - {formatDate(report.period.endDate)}</p>
            {report.period.branch && (
              <p><strong>Şube:</strong> {report.period.branch.name}</p>
            )}
            <p><strong>Rapor Tarihi:</strong> {new Date().toLocaleString('tr-TR')}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 font-medium mb-1">Toplam Satış</div>
            <div className="text-2xl font-bold text-green-900">{report.summary.totalSales}</div>
            <div className="text-lg text-green-700 mt-1">{formatCurrency(report.summary.totalSalesAmount)}</div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700 font-medium mb-1">Toplam İade</div>
            <div className="text-2xl font-bold text-red-900">{report.summary.totalRefunds}</div>
            <div className="text-lg text-red-700 mt-1">{formatCurrency(report.summary.totalRefundAmount)}</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-700 font-medium mb-1">İndirim</div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(report.summary.totalDiscount)}</div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-700 font-medium mb-1">Net Kalan</div>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(report.summary.netAmount)}</div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Ödeme Yöntemleri</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(report.paymentMethods).map(([method, data]) => (
              <div key={method} className="border rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">{getPaymentMethodLabel(method)}</div>
                <div className="text-xl font-bold text-gray-900">{data.count}</div>
                <div className="text-sm text-gray-600 mt-1">{formatCurrency(data.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Breakdown */}
        {report.dailyBreakdown && report.dailyBreakdown.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Günlük Detay</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Satış</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">İade</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.dailyBreakdown.map((day, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(day.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {day.sales.count} / {formatCurrency(day.sales.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">
                        {day.refunds.count} / {formatCurrency(day.refunds.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {formatCurrency(day.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sales List (Last 20) */}
        {report.salesList && report.salesList.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Satış Listesi (Son 20)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiş No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ödeme</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kasiyer</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.salesList.slice(0, 20).map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{sale.saleNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sale.date).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {getPaymentMethodLabel(sale.paymentMethod)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{sale.cashier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refunds List */}
        {report.refundsList && report.refundsList.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">İade Listesi</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiş No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">İade Tutarı</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.refundsList.slice(0, 20).map((refund) => (
                    <tr key={refund.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{refund.saleNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(refund.date).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-red-600">
                        {formatCurrency(refund.total)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {refund.status === 'REFUNDED' ? 'Tam İade' : 'Kısmi İade'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default CashRegisterReport;

