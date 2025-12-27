import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useCashRegisterReport } from '../../hooks/useReports';
import { useBranches } from '../../hooks/useBranches';
import Select from '../common/Select';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';
import { getLogoUrl } from '../../config/logo';

const MonthlyReport = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: branchesData } = useBranches({ limit: 100, isActive: true });
  const branches = branchesData?.data?.branches || [];

  // Get current month's start and end dates
  const getCurrentMonthDates = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const [filters, setFilters] = useState(() => {
    const dates = getCurrentMonthDates();
    return {
      branchId: '',
      startDate: dates.startDate,
      endDate: dates.endDate,
      period: 'monthly',
    };
  });

  const { data, isLoading, error, refetch } = useCashRegisterReport(filters);
  const report = data?.data;
  
  // Default to UZS for reports (reports aggregate multiple currencies)
  const reportCurrency = 'UZS';

  const getLocale = () => {
    const localeMap = {
      'tr': 'tr-TR',
      'en': 'en-US',
      'ru': 'ru-RU',
      'uz': 'uz-UZ'
    };
    return localeMap[i18n.language] || 'tr-TR';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(getLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatMonth = (dateString) => {
    return new Date(dateString).toLocaleDateString(getLocale(), {
      year: 'numeric',
      month: 'long',
    });
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (error) {
      console.error('Print error:', error);
      alert(t('reports.printError'));
    }
  };

  // Update dates when month changes
  const handleMonthChange = (field, value) => {
    const date = new Date(value);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    setFilters((prev) => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }));
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
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label={t('reports.branch')}
            value={filters.branchId}
            onChange={(e) => setFilters((prev) => ({ ...prev, branchId: e.target.value }))}
            options={[
              { value: '', label: t('inventory.allBranches') },
              ...branches.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.selectMonthLabel')}</label>
            <input
              type="month"
              value={filters.startDate.substring(0, 7)}
              onChange={(e) => handleMonthChange('startDate', e.target.value + '-01')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={refetch} variant="primary" className="w-full">
              {t('reports.refreshReport')}
            </Button>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div id="monthly-report" className="bg-white rounded-lg shadow p-6 print:shadow-none">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('reports.monthEndTitle')}
          </h2>
          <div className="flex gap-2">
            <Button onClick={refetch} variant="outline" size="sm">
              {t('reports.refresh')}
            </Button>
            <Button onClick={handlePrint} variant="primary">
              {t('reports.print')}
            </Button>
          </div>
        </div>

        {/* Report Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="text-center mb-4">
            <div className="mb-2">
              <img 
                src={getLogoUrl('report')} 
                alt="Vidalita" 
                className="h-16 mx-auto object-contain print:h-12"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'block';
                  }
                }}
              />
              <h1 className="text-2xl font-bold text-gray-900 mb-2 hidden">{t('reports.companyName')}</h1>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">{t('reports.monthEndTitle')}</h2>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>{t('reports.month')}:</strong> {formatMonth(filters.startDate)}</p>
            {report.period?.branch && (
              <p><strong>{t('reports.branch')}:</strong> {report.period.branch.name}</p>
            )}
            <p><strong>{t('reports.reportDate')}</strong> {new Date().toLocaleString(getLocale())}</p>
            {user && (
              <p><strong>{t('reports.receivedBy')}</strong> {user.fullName || user.username}</p>
            )}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.detailedSummary')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">{t('reports.totalSales')}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(report.summary?.totalSalesAmount || 0, reportCurrency)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">{t('reports.cashSales')}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(cashTotal, reportCurrency)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">{t('reports.cardSales')}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(cardTotal, reportCurrency)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">{t('reports.creditSales')}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(creditTotal, reportCurrency)}</span>
            </div>
            {mixedTotal > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t('reports.mixedPayment')}</span>
                <span className="font-semibold text-gray-900">{formatCurrency(mixedTotal, reportCurrency)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">{t('reports.totalDiscount')}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(report.summary?.totalDiscount || 0, reportCurrency)}</span>
            </div>
            <div className="flex justify-between py-2 border-b-2 border-gray-300">
              <span className="text-gray-900 font-semibold">{t('reports.netCash')}</span>
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
          
          #monthly-report,
          #monthly-report * {
            visibility: visible;
          }
          
          #monthly-report {
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

export default MonthlyReport;

