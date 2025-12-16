import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '../components/layout/PageLayout';
import { useCreateBranch, useUpdateBranch } from '../hooks/useBranches';
import BranchList from '../components/branches/BranchList';
import BranchForm from '../components/branches/BranchForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

const Branches = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const handleCreate = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingBranch) {
        await updateBranch.mutateAsync({
          id: editingBranch.id,
          data: formData,
        });
      } else {
        await createBranch.mutateAsync(formData);
      }
      handleClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const isLoading = createBranch.isLoading || updateBranch.isLoading;

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
                  className="text-primary-600 font-medium px-2 py-2 rounded-md text-sm whitespace-nowrap"
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('branches.title')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('branches.subtitle')}
          </p>
        </div>

        <BranchList onEdit={handleEdit} onCreate={handleCreate} />

        <Modal
          isOpen={isModalOpen}
          onClose={handleClose}
          title={editingBranch ? t('branches.edit') : t('branches.create')}
          size="lg"
        >
          <BranchForm
            branch={editingBranch}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
          />
        </Modal>
      </main>
    </div>
  );
};

export default Branches;

