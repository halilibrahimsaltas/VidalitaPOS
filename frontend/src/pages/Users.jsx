import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '../components/layout/PageLayout';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

const Users = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

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
      alert(error.response?.data?.message || t('common.errorOccurred'));
    }
  };

  const isLoading = createUser.isLoading || updateUser.isLoading;

  return (
    <PageLayout
      title={t('navigation.users')}
      description={t('users.subtitle')}
      actions={
        <Button variant="primary" onClick={handleCreate}>
          {t('users.create')}
        </Button>
      }
    >
      <UserList onEdit={handleEdit} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingUser ? t('users.edit') : t('users.create')}
        size="md"
      >
        <UserForm
          user={editingUser}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={isLoading}
        />
      </Modal>
    </PageLayout>
  );
};

export default Users;

