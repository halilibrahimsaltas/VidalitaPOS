import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesChart = ({ data }) => {
  const { t } = useTranslation();
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        {t('dashboard.noData')}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} name={t('dashboard.revenue')} />
        <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name={t('dashboard.salesCount')} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;

