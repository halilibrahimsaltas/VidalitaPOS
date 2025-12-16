const StatCard = ({ title, value, subtitle, trend, trendValue, color = 'gray' }) => {
  const colorClasses = {
    gray: 'bg-white border-gray-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`card border p-4 sm:p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 truncate flex-1 min-w-0">{title}</h3>
      </div>
      <div className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1 truncate">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 truncate">{subtitle}</div>}
      {trend && trendValue && (
        <div className={`text-xs mt-2 font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </div>
      )}
    </div>
  );
};

export default StatCard;

