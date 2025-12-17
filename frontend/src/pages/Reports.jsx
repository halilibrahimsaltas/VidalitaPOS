import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '../components/layout/PageLayout';
import CashRegisterReport from '../components/reports/CashRegisterReport';
import MonthlyReport from '../components/reports/MonthlyReport';
import Button from '../components/common/Button';

const Reports = () => {
  const { t } = useTranslation();
  const [activeReport, setActiveReport] = useState('cash-register');

  const reports = [
    { id: 'cash-register', name: t('reports.endOfDay') },
    { id: 'monthly', name: t('reports.monthEnd') },
    // Future reports can be added here
    // { id: 'sales-summary', name: 'Satış Özet Raporu', icon: '📊' },
    // { id: 'inventory', name: 'Stok Durum Raporu', icon: '📦' },
  ];

  return (
    <PageLayout
      title={t('navigation.reports')}
      description={t('reports.subtitle')}
    >
        {/* Report Type Selector */}
        <div className="mb-6 card p-4">
          <div className="flex flex-wrap gap-2">
            {reports.map((report) => (
              <Button
                key={report.id}
                variant={activeReport === report.id ? 'primary' : 'secondary'}
                onClick={() => setActiveReport(report.id)}
              >
                {report.icon && <span className="mr-2">{report.icon}</span>}
                {report.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Report */}
        <div>
          {activeReport === 'cash-register' && <CashRegisterReport />}
          {activeReport === 'monthly' && <MonthlyReport />}
          {/* Future reports can be added here */}
        </div>
    </PageLayout>
  );
};

export default Reports;

