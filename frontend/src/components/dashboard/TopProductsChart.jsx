import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TopProductsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Veri bulunamadı
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.product.name.length > 15 ? item.product.name.substring(0, 15) + '...' : item.product.name,
    quantity: item.quantity,
    revenue: parseFloat(item.revenue.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="quantity" fill="#0ea5e9" name="Satılan Miktar" />
        <Bar dataKey="revenue" fill="#10b981" name="Gelir (₺)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopProductsChart;

