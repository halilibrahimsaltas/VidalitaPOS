import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboardOverview, useTopProducts, useSalesSummary } from '../hooks/useReports';
import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import TopProductsChart from '../components/dashboard/TopProductsChart';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: overviewData, isLoading: overviewLoading } = useDashboardOverview();
  const { data: topProductsData, isLoading: topProductsLoading } = useTopProducts({ limit: 5 });
  
  // Get last 7 days for sales chart
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  const { data: salesSummaryData } = useSalesSummary({ startDate: startDateStr, endDate });

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const overview = overviewData?.data || {};
  const sales = overview.sales || {};
  const inventory = overview.inventory || {};
  const customers = overview.customers || {};
  const topProducts = topProductsData?.data || [];
  const salesChartData = salesSummaryData?.data?.dailyBreakdown || [];

  // Calculate trends
  const revenueTrend = sales.yesterday?.revenue > 0
    ? (((sales.today?.revenue || 0) - sales.yesterday.revenue) / sales.yesterday.revenue * 100).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">
                🛍️ Vidalita Retail Manager
              </h1>
              <nav className="hidden md:flex space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/branches"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Şubeler
                </Link>
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Ürünler
                </Link>
                <Link
                  to="/inventory"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Stok
                </Link>
                <Link
                  to="/pos"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  POS
                </Link>
                <Link
                  to="/customers"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Müşteriler
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Hoş geldiniz, <strong>{user?.fullName || user?.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Genel bakış ve istatistikler
          </p>
        </div>

        {overviewLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Yükleniyor...</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Bugünkü Gelir"
                value={`₺${(sales.today?.revenue || 0).toFixed(2)}`}
                subtitle={`${sales.today?.count || 0} satış`}
                icon="💰"
                color="green"
                trend={revenueTrend && parseFloat(revenueTrend) > 0 ? 'up' : revenueTrend && parseFloat(revenueTrend) < 0 ? 'down' : null}
                trendValue={revenueTrend ? `${Math.abs(parseFloat(revenueTrend))}%` : null}
              />
              <StatCard
                title="Son 7 Gün"
                value={`₺${(sales.last7Days?.revenue || 0).toFixed(2)}`}
                subtitle={`${sales.last7Days?.count || 0} satış`}
                icon="📊"
                color="blue"
              />
              <StatCard
                title="Düşük Stok"
                value={inventory.lowStockCount || 0}
                subtitle={`${inventory.totalProducts || 0} toplam ürün`}
                icon="⚠️"
                color="red"
              />
              <StatCard
                title="Toplam Borç"
                value={`₺${(customers.totalDebt || 0).toFixed(2)}`}
                subtitle={`${customers.debtorsCount || 0} müşteri`}
                icon="💳"
                color="yellow"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Sales Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Son 7 Gün Satış Trendi</h3>
                {overviewLoading ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    Yükleniyor...
                  </div>
                ) : (
                  <SalesChart data={salesChartData} />
                )}
              </div>

              {/* Top Products Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">En Çok Satan Ürünler</h3>
                {topProductsLoading ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    Yükleniyor...
                  </div>
                ) : (
                  <TopProductsChart data={topProducts} />
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Hızlı İşlemler</h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/pos"
                  className="inline-block btn btn-primary text-lg px-6 py-3"
                >
                  🛒 POS Ekranına Git →
                </Link>
                <Link
                  to="/branches"
                  className="inline-block btn btn-secondary"
                >
                  Şube Yönetimi →
                </Link>
                <Link
                  to="/products"
                  className="inline-block btn btn-secondary"
                >
                  Ürün Yönetimi →
                </Link>
                <Link
                  to="/inventory"
                  className="inline-block btn btn-secondary"
                >
                  Stok Yönetimi →
                </Link>
                <Link
                  to="/customers"
                  className="inline-block btn btn-secondary"
                >
                  Müşteri Yönetimi →
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
