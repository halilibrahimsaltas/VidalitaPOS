import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const quickActions = [
    { path: '/dashboard', key: 'navigation.dashboard', icon: 'D' },
    { path: '/pos', key: 'navigation.pos', icon: 'P' },
    { path: '/branches', key: 'navigation.branches', icon: 'B' },
    { path: '/products', key: 'navigation.products', icon: 'Ü' },
    { path: '/inventory', key: 'navigation.inventory', icon: 'S' },
    { path: '/sales', key: 'navigation.sales', icon: 'S' },
    { path: '/customers', key: 'navigation.customers', icon: 'M' },
    { path: '/reports', key: 'navigation.reports', icon: 'R' },
    { path: '/users', key: 'navigation.users', icon: 'K' },
  ];

  return (
    <aside className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t('dashboard.quickActions')}
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {quickActions.map((action) => (
            <li key={action.path}>
              <Link
                to={action.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive(action.path)
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-xs font-semibold ${
                  isActive(action.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {action.icon}
                </span>
                <span className="truncate">{t(action.key)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

