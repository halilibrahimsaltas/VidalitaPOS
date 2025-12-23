import { useTranslation } from 'react-i18next';
import { useDashboardOverview, useSalesSummary } from '../hooks/useReports';
import { useSales } from '../hooks/useSales';
import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import PageLayout from '../components/layout/PageLayout';
import { formatCurrency } from '../utils/currency';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const localeMap = {
      'tr': 'tr-TR',
      'en': 'en-US',
      'ru': 'ru-RU',
      'uz': 'uz-UZ'
    };
    const locale = localeMap[i18n.language] || 'tr-TR';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const { data: overviewData, isLoading: overviewLoading } = useDashboardOverview();
  
  // Get last 7 days for sales chart
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  const { data: salesSummaryData } = useSalesSummary({ startDate: startDateStr, endDate });
  
  // Get last 5 sales without filters
  const { data: recentSalesData, isLoading: recentSalesLoading } = useSales({
    page: 1,
    limit: 5,
    status: 'COMPLETED',
  });

  const overview = overviewData?.data || {};
  const sales = overview.sales || {};
  const inventory = overview.inventory || {};
  const customers = overview.customers || {};
  const salesChartData = salesSummaryData?.data?.dailyBreakdown || [];
  const recentSales = recentSalesData?.data?.sales || [];

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
                value={formatCurrency(sales.today?.revenue || 0, 'UZS')}
                subtitle={`${sales.today?.count || 0} ${t('dashboard.sales')}`}
                color="green"
              />
              <StatCard
                title={t('dashboard.last7Days')}
                value={formatCurrency(sales.last7Days?.revenue || 0, 'UZS')}
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
                value={formatCurrency(customers.totalDebt || 0, 'UZS')}
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

              {/* Recent Sales */}
              <div className="card p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t('dashboard.recentSales')}</h3>
                {recentSalesLoading ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    {t('common.loading')}
                  </div>
                ) : recentSales.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    {t('dashboard.noRecentSales')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSales.map((sale) => {
                      const saleCurrency = sale.items && sale.items.length > 0
                        ? sale.items[0]?.product?.currency || 'UZS'
                        : 'UZS';
                      
                      // Calculate total quantity of items sold
                      const totalQuantity = sale.items?.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0) || 0;

                      return (
                        <div
                          key={sale.id}
                          className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {t('sales.saleNumber')}: {sale.saleNumber}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mb-1">
                                {formatDate(sale.createdAt)}
                              </div>
                              {sale.customer && (
                                <div className="text-xs text-gray-600 mb-1">
                                  {t('sales.customer')}: {sale.customer.name || t('pos.customerSelector.anonymous')}
                                </div>
                              )}
                              <div className="text-xs text-gray-600">
                                {t('dashboard.totalQuantity')}: {totalQuantity} {t('dashboard.items')}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-xs text-gray-500 mb-1">
                                {t('dashboard.totalAmount')}
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {formatCurrency(parseFloat(sale.total || 0), saleCurrency)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </>
        )}
    </PageLayout>
  );
};

export default Dashboard;
