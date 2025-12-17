import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        // Determine redirect path based on user role and permissions
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const permissions = userData.permissions || [];
        
        console.log('Redirecting user:', {
          role: userData.role,
          permissions: permissions,
          permissionsCount: permissions.length,
          hasPosUse: permissions.includes('pos.use'),
          hasDashboardView: permissions.includes('dashboard.view'),
        });

        // Admin always goes to dashboard
        if (userData.role === 'ADMIN') {
          navigate('/dashboard', { replace: true });
          return;
        }

        // Check if user has any permissions at all
        if (!permissions || permissions.length === 0) {
          console.error('⚠️ User has no permissions assigned. Please contact administrator.');
          setError('Kullanıcınızın yetkileri atanmamış. Lütfen yönetici ile iletişime geçin.');
          // Still allow login but redirect to dashboard (admin can fix permissions)
          navigate('/dashboard', { replace: true });
          return;
        }

        // Cashier with POS permission goes to POS
        if (userData.role === 'CASHIER' && permissions.includes('pos.use')) {
          navigate('/pos', { replace: true });
        } 
        // Users with dashboard permission go to dashboard
        else if (permissions.includes('dashboard.view')) {
          navigate('/dashboard', { replace: true });
        } 
        // Users with POS permission go to POS
        else if (permissions.includes('pos.use')) {
          navigate('/pos', { replace: true });
        } 
        // Fallback: go to dashboard (admin can assign proper permissions)
        else {
          console.warn('⚠️ No suitable page found for user permissions. Redirecting to dashboard.');
          navigate('/dashboard', { replace: true });
        }
      }, 100);
    } else {
      setError(result.message || t('auth.loginFailed'));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Logo Section */}
          <div className="text-center mb-10">
            {/* Logo Image or Text */}
            <div className="mb-6">
              {!logoError ? (
                <img 
                  src="/vidalita.jpg" 
                  alt="Vidalita" 
                  className="h-20 mx-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="logo-text">
                  <div className="text-5xl font-bold text-blue-700 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    Vidalita
                  </div>
                  <div className="text-xs text-blue-600 uppercase tracking-wider">
                    PURE BY NATURE
                  </div>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              {t('auth.login')}
            </h2>
            <p className="text-sm text-gray-500">
              Retail Management System
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.username')}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={t('auth.username')}
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={t('auth.password')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.loading')}
                </span>
              ) : (
                t('auth.login')
              )}
            </button>
          </form>

          {/* Default Admin Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">{t('auth.defaultAdmin')}</p>
            <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md">
              <span className="text-xs font-mono text-gray-700">admin</span>
              <span className="text-gray-400">/</span>
              <span className="text-xs font-mono text-gray-700">admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

