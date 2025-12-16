import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboardOverview, useTopProducts, useSalesSummary } from '../hooks/useReports';
import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import TopProductsChart from '../components/dashboard/TopProductsChart';
import PageLayout from '../components/layout/PageLayout';

const Dashboard = () => {
  const { t } = useTranslation();

  const { data: overviewData, isLoading: overviewLoading } = useDashboardOverview();
  const { data: topProductsData, isLoading: topProductsLoading } = useTopProducts({ limit: 5 });
  
  // Get last 7 days for sales chart
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  const { data: salesSummaryData } = useSalesSummary({ startDate: startDateStr, endDate });

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
    <PageLayout
      title={t('dashboard.title')}
      description={t('dashboard.overview')}
    >

        {overviewLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">{t('common.loading')}</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title={t('dashboard.todayRevenue')}
                value={`₺${(sales.today?.revenue || 0).toFixed(2)}`}
                subtitle={`${sales.today?.count || 0} ${t('dashboard.sales')}`}
                color="green"
                trend={revenueTrend && parseFloat(revenueTrend) > 0 ? 'up' : revenueTrend && parseFloat(revenueTrend) < 0 ? 'down' : null}
                trendValue={revenueTrend ? `${Math.abs(parseFloat(revenueTrend))}%` : null}
              />
              <StatCard
                title={t('dashboard.last7Days')}
                value={`₺${(sales.last7Days?.revenue || 0).toFixed(2)}`}
                subtitle={`${sales.last7Days?.count || 0} ${t('dashboard.sales')}`}
                color="blue"
              />
              <StatCard
                title={t('dashboard.lowStock')}
                value={inventory.lowStockCount || 0}
                subtitle={`${inventory.totalProducts || 0} ${t('dashboard.totalProducts')}`}
                color="red"
              />
              <StatCard
                title={t('dashboard.totalDebt')}
                value={`₺${(customers.totalDebt || 0).toFixed(2)}`}
                subtitle={`${customers.debtorsCount || 0} ${t('dashboard.customers')}`}
                color="gray"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Sales Chart */}
              <div className="card p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t('dashboard.salesTrend')}</h3>
                {overviewLoading ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    {t('common.loading')}
                  </div>
                ) : (
                  <SalesChart data={salesChartData} />
                )}
              </div>

              {/* Top Products Chart */}
              <div className="card p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t('dashboard.topProducts')}</h3>
                {topProductsLoading ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    {t('common.loading')}
                  </div>
                ) : (
                  <TopProductsChart data={topProducts} />
                )}
              </div>
            </div>

          </>
        )}
    </PageLayout>
  );
};

export default Dashboard;
