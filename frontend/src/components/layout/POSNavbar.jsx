import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { LOGO_URL } from '../../config/logo';
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
  const { hasPermission, user } = useAuth();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Define menu items with required permissions
  const allMenuItems = [
    { path: '/dashboard', key: 'navigation.dashboard', icon: HiHome, permission: 'dashboard.view' },
    { path: '/pos', key: 'navigation.pos', icon: HiShoppingCart, permission: 'pos.use' },
    { path: '/branches', key: 'navigation.branches', icon: HiBuildingStorefront, permission: 'branches.view', requireAdmin: true },
    { path: '/products', key: 'navigation.products', icon: HiCube, permission: 'products.view' },
    { path: '/inventory', key: 'navigation.inventory', icon: HiArchiveBox, permission: 'inventory.view' },
    { path: '/sales', key: 'navigation.sales', icon: HiReceiptPercent, permission: 'sales.view' },
    { path: '/customers', key: 'navigation.customers', icon: HiUserGroup, permission: 'customers.view' },
    { path: '/reports', key: 'navigation.reports', icon: HiChartBar, permission: 'reports.view' },
    { path: '/users', key: 'navigation.users', icon: HiUsers, permission: 'users.view', requireAdmin: true },
  ];

  // Filter menu items based on permissions and admin requirement
  const quickActions = allMenuItems.filter(item => {
    // If requireAdmin is true, only show for ADMIN
    if (item.requireAdmin && user?.role !== 'ADMIN') {
      return false;
    }
    // Check permission
    return hasPermission(item.permission);
  });

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 mr-4 flex-shrink-0">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg flex-shrink-0 border border-gray-200">
                <img 
                  src={LOGO_URL} 
                  alt="V" 
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'block';
                    }
                  }}
                />
                <span className="text-blue-600 font-bold text-sm hidden">V</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 hidden sm:block">
                Vidalita
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-1 overflow-x-auto flex-1">
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

