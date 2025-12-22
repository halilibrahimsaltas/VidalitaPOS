import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useCashRegisterReport } from '../../hooks/useReports';
import { useBranches } from '../../hooks/useBranches';
import Select from '../common/Select';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';

const CashRegisterReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: branchesData } = useBranches({ limit: 100, isActive: true });
  const branches = branchesData?.data?.branches || [];

  const [filters, setFilters] = useState({
    branchId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data, isLoading, error, refetch } = useCashRegisterReport(filters);
  const report = data?.data;
  
  // Default to UZS for reports (reports aggregate multiple currencies)
  const reportCurrency = 'UZS';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (error) {
      console.error('Print error:', error);
      alert('Yazdırma işlemi başlatılamadı. Lütfen tarayıcınızın yazdırma ayarlarını kontrol edin.');
    }
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
        {t('reports.loadError')}
      </div>
    );
  }

  if (!report) {
    return null;
  }

  // Calculate totals by payment method
  const cashTotal = report.paymentMethods?.CASH?.amount || 0;
  const cardTotal = report.paymentMethods?.CARD?.amount || 0;
  const creditTotal = report.paymentMethods?.CREDIT?.amount || 0;
  const mixedTotal = report.paymentMethods?.MIXED?.amount || 0;
  const refundTotal = report.summary?.totalRefundAmount || 0;
  const totalCash = cashTotal + (mixedTotal * 0.5); // Approximate for mixed
  const totalCard = cardTotal + (mixedTotal * 0.5); // Approximate for mixed
  const netTotal = (report.summary?.netAmount || 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={refetch} variant="primary">
            Raporu Yenile
          </Button>
        </div>
      </div>

      {/* Report Summary */}
      <div id="cash-register-report" className="card p-6 print:shadow-none">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h2 className="text-2xl font-semibold text-gray-900">
            Gün Sonu Kasa Raporu
          </h2>
          <div className="flex gap-2">
            <Button onClick={refetch} variant="outline" size="sm">
              Yenile
            </Button>
            <Button onClick={handlePrint} variant="primary">
              🖨️ Yazdır
            </Button>
          </div>
        </div>

        {/* Report Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Vidalita</h1>
            <h2 className="text-lg font-semibold text-gray-700">Gün Sonu Kasa Raporu</h2>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Tarih:</strong> {formatDate(filters.startDate)} - {formatDate(filters.endDate)}</p>
            {report.period?.branch && (
              <p><strong>Şube:</strong> {report.period.branch.name}</p>
            )}
            <p><strong>Rapor Tarihi:</strong> {new Date().toLocaleString('tr-TR')}</p>
            {user && (
              <p><strong>Alıcı Personel:</strong> {user.fullName || user.username}</p>
            )}
          </div>
        </div>

        {/* Simple Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-1">Alınan Nakit</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCash, reportCurrency)}</div>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-1">Alınan Kredi Kartı</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCard, reportCurrency)}</div>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-1">Toplam İade</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(refundTotal, reportCurrency)}</div>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-1">Toplam Kasa</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(netTotal, reportCurrency)}</div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detaylı Özet</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Toplam Satış:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(report.summary?.totalSalesAmount || 0, reportCurrency)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Nakit Satış:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(cashTotal, reportCurrency)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Kart Satış:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(cardTotal, reportCurrency)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Veresiye Satış:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(creditTotal, reportCurrency)}</span>
            </div>
            {mixedTotal > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Karma Ödeme:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(mixedTotal, reportCurrency)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Toplam İndirim:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(report.summary?.totalDiscount || 0, reportCurrency)}</span>
            </div>
            <div className="flex justify-between py-2 border-b-2 border-gray-300">
              <span className="text-gray-900 font-semibold">Net Kasa:</span>
              <span className="font-bold text-lg text-gray-900">{formatCurrency(netTotal, reportCurrency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          
          body * {
            visibility: hidden;
          }
          
          #cash-register-report,
          #cash-register-report * {
            visibility: visible;
          }
          
          #cash-register-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
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
