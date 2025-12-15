import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import Modal from '../components/common/Modal';

const Users = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const handleLogout = () => {
    logout();
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (userData) => {
    setEditingUser(userData);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          data: formData,
        });
      } else {
        await createUser.mutateAsync(formData);
      }
      handleClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const isLoading = createUser.isLoading || updateUser.isLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 md:space-x-8 flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                🛍️ Vidalita Retail Manager
              </h1>
              <nav className="hidden md:flex space-x-2 items-center">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.dashboard')}
                </Link>
                <Link
                  to="/branches"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.branches')}
                </Link>
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.products')}
                </Link>
                <Link
                  to="/inventory"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.inventory')}
                </Link>
                <Link
                  to="/pos"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.pos')}
                </Link>
                <Link
                  to="/sales"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  Satış Geçmişi
                </Link>
                <Link
                  to="/customers"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.customers')}
                </Link>
                <Link
                  to="/users"
                  className="text-primary-600 font-medium px-2 py-2 rounded-md text-sm whitespace-nowrap"
                >
                  Kullanıcı Yönetimi
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              <LanguageSwitcher />
              <span className="text-sm text-gray-700 whitespace-nowrap hidden lg:inline">
                {t('auth.welcome')}, <strong>{user?.fullName || user?.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm whitespace-nowrap"
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
            <p className="mt-2 text-sm text-gray-600">
              Kullanıcıları oluşturun, düzenleyin ve yönetin
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="btn btn-primary"
          >
            + Yeni Kullanıcı
          </button>
        </div>

        <UserList onEdit={handleEdit} />

        <Modal
          isOpen={isModalOpen}
          onClose={handleClose}
          title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}
          size="md"
        >
          <UserForm
            user={editingUser}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
          />
        </Modal>
      </main>
    </div>
  );
};

export default Users;

