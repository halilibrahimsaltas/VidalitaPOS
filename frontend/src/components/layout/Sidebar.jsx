import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
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

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { hasPermission } = useAuth();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const { user } = useAuth();

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
    <aside className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t('dashboard.quickActions')}
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <li key={action.path}>
                <Link
                  to={action.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-all ${
                    isActive(action.path)
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className={`flex-shrink-0 w-5 h-5 ${
                    isActive(action.path)
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`} />
                  <span className="truncate">{t(action.key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

