import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', key: 'navigation.dashboard' },
    { path: '/branches', key: 'navigation.branches' },
    { path: '/products', key: 'navigation.products' },
    { path: '/inventory', key: 'navigation.inventory' },
    { path: '/pos', key: 'navigation.pos' },
    { path: '/sales', key: 'navigation.sales' },
    { path: '/customers', key: 'navigation.customers' },
    { path: '/reports', key: 'navigation.reports' },
    { path: '/users', key: 'navigation.users' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 min-w-0">
            <Link to="/dashboard" className="flex items-center space-x-2 mr-4">
              <span className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                Vidalita
              </span>
            </Link>
            <nav className="hidden lg:flex space-x-1 items-center overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <LanguageSwitcher />
            <span className="hidden xl:inline text-sm text-gray-600 truncate max-w-[150px]">
              {user?.fullName || user?.username}
            </span>
            <button
              onClick={logout}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors whitespace-nowrap"
            >
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

