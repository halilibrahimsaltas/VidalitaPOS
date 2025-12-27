import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { LOGO_URL } from '../../config/logo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm h-16">
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center space-x-3 flex-shrink-0 min-w-0">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg flex-shrink-0 border border-gray-200">
                <img 
                  src={LOGO_URL} 
                  alt="V" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="text-blue-600 font-bold text-lg hidden">V</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-semibold text-gray-900 truncate">
                  Vidalita Retail
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {user?.branch?.name || 'Mağaza'}
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <LanguageSwitcher />
            <div className="hidden md:flex flex-col items-end min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                {user?.fullName || user?.username}
              </span>
              <span className="text-xs text-gray-500 truncate max-w-[150px]">
                {user?.role || 'Kullanıcı'}
              </span>
            </div>
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

