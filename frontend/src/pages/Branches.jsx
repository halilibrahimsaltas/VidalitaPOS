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
      alert(error.response?.data?.message || t('common.errorOccurred'));
    }
  };

  const isLoading = createBranch.isLoading || updateBranch.isLoading;

  return (
    <PageLayout
      title={t('branches.title')}
      description={t('branches.subtitle')}
      actions={
        <Button variant="primary" onClick={handleCreate}>
          {t('branches.create')}
        </Button>
      }
    >
        <BranchList onEdit={handleEdit} />

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
    </PageLayout>
  );
};

export default Branches;

