import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateBranch, useUpdateBranch } from '../hooks/useBranches';
import BranchList from '../components/branches/BranchList';
import BranchForm from '../components/branches/BranchForm';
import Modal from '../components/common/Modal';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    </div>
  );
};

export default Branches;

