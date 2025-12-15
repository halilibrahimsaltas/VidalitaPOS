import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import CashRegisterReport from '../components/reports/CashRegisterReport';
import Button from '../components/common/Button';

const Reports = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [activeReport, setActiveReport] = useState('cash-register');

  const handleLogout = () => {
    logout();
  };

  const reports = [
    { id: 'cash-register', name: 'Gün Sonu Kasa Raporu', icon: '💰' },
    // Future reports can be added here
    // { id: 'sales-summary', name: 'Satış Özet Raporu', icon: '📊' },
    // { id: 'inventory', name: 'Stok Durum Raporu', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 md:space-x-8 flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                🛍️ Vidalita Retail Manager
              </h1>
              <nav className="hidden md:flex space-x-2 items-center">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.dashboard')}
                </Link>
                <Link
                  to="/branches"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.branches')}
                </Link>
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.products')}
                </Link>
                <Link
                  to="/inventory"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.inventory')}
                </Link>
                <Link
                  to="/pos"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.pos')}
                </Link>
                <Link
                  to="/sales"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  Satış Geçmişi
                </Link>
                <Link
                  to="/customers"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.customers')}
                </Link>
                <Link
                  to="/reports"
                  className="text-primary-600 font-medium px-2 py-2 rounded-md text-sm whitespace-nowrap"
                >
                  Raporlar
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              <LanguageSwitcher />
              <span className="text-sm text-gray-700 whitespace-nowrap hidden lg:inline">
                {t('auth.welcome')}, <strong>{user?.fullName || user?.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm whitespace-nowrap"
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
          <p className="mt-2 text-sm text-gray-600">
            Satış, kasa ve stok raporlarını görüntüleyin
          </p>
        </div>

        {/* Report Type Selector */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            {reports.map((report) => (
              <Button
                key={report.id}
                variant={activeReport === report.id ? 'primary' : 'secondary'}
                onClick={() => setActiveReport(report.id)}
              >
                {report.icon} {report.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Report */}
        <div>
          {activeReport === 'cash-register' && <CashRegisterReport />}
          {/* Future reports can be added here */}
        </div>
      </main>
    </div>
  );
};

export default Reports;

