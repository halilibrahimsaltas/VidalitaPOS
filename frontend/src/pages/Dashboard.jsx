import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">
                🛍️ Vidalita Retail Manager
              </h1>
              <nav className="hidden md:flex space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/branches"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Şubeler
                </Link>
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Ürünler
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Hoş geldiniz, <strong>{user?.fullName || user?.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-600">
            Hoş geldiniz! Bu sayfa geliştirme aşamasındadır.
          </p>
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-800">
              <strong>Kullanıcı Bilgileri:</strong>
            </p>
            <ul className="mt-2 text-sm text-primary-700 space-y-1">
              <li>ID: {user?.id}</li>
              <li>Kullanıcı Adı: {user?.username}</li>
              <li>Email: {user?.email}</li>
              <li>Rol: {user?.role}</li>
            </ul>
          </div>
          <div className="mt-6 flex gap-4">
            <Link
              to="/branches"
              className="inline-block btn btn-primary"
            >
              Şube Yönetimi →
            </Link>
            <Link
              to="/products"
              className="inline-block btn btn-primary"
            >
              Ürün Yönetimi →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

