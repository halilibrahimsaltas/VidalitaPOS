import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HiHome, 
  HiShoppingCart, 
  HiBuildingStorefront, 
  HiCube, 
  HiArchiveBox,
  HiReceiptPercent,
  HiUserGroup,
  HiChartBar,
  HiUsers
} from 'react-icons/hi2';

const POSNavbar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const quickActions = [
    { path: '/dashboard', key: 'navigation.dashboard', icon: HiHome },
    { path: '/pos', key: 'navigation.pos', icon: HiShoppingCart },
    { path: '/branches', key: 'navigation.branches', icon: HiBuildingStorefront },
    { path: '/products', key: 'navigation.products', icon: HiCube },
    { path: '/inventory', key: 'navigation.inventory', icon: HiArchiveBox },
    { path: '/sales', key: 'navigation.sales', icon: HiReceiptPercent },
    { path: '/customers', key: 'navigation.customers', icon: HiUserGroup },
    { path: '/reports', key: 'navigation.reports', icon: HiChartBar },
    { path: '/users', key: 'navigation.users', icon: HiUsers },
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    isActive(action.path)
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className={`flex-shrink-0 w-4 h-4 ${
                    isActive(action.path)
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`} />
                  <span className="truncate">{t(action.key)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSNavbar;

