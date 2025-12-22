import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import PermissionManager from './PermissionManager';

const UserList = ({ onEdit }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [search, setSearch] = useState('');
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { data, isLoading, error } = useUsers({
    page,
    limit: 10,
    role: roleFilter || undefined,
    isActive: isActiveFilter || undefined,
    search: search || undefined,
  });

  const deleteUser = useDeleteUser();

  const handleDelete = async (userId) => {
    if (!window.confirm(t('users.deleteConfirm'))) {
      return;
    }

    try {
      await deleteUser.mutateAsync(userId);
    } catch (error) {
      alert(error.response?.data?.message || t('errors.deleteUser'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {t('errors.loadUsers')}
      </div>
    );
  }

  const { users, pagination } = data?.data || { users: [], pagination: {} };

  const roleOptions = [
    { value: '', label: 'Tüm Roller' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MANAGER', label: 'Yönetici' },
    { value: 'USER', label: t('users.roles.USER') },
    { value: 'CASHIER', label: 'Kasiyer' },
  ];

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'true', label: 'Aktif' },
    { value: 'false', label: 'Pasif' },
  ];

  const roleLabels = {
    ADMIN: 'Admin',
    MANAGER: 'Yönetici',
    USER: t('users.roles.USER'),
    CASHIER: 'Kasiyer',
  };

  const roleColors = {
    ADMIN: 'badge-danger',
    MANAGER: 'badge-info',
    USER: 'badge-gray',
    CASHIER: 'badge-success',
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Ara"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('users.searchPlaceholder')}
          />
          <Select
            label="Rol"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            options={roleOptions}
          />
          <Select
            label="Durum"
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value);
              setPage(1);
            }}
            options={statusOptions}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell min-w-[120px]">{t('users.username')}</th>
                <th className="table-header-cell min-w-[150px]">Ad Soyad</th>
                <th className="table-header-cell min-w-[180px] hidden lg:table-cell">Email</th>
                <th className="table-header-cell min-w-[100px]">Rol</th>
                <th className="table-header-cell min-w-[120px] hidden md:table-cell">Şube</th>
                <th className="table-header-cell min-w-[80px]">Durum</th>
                <th className="table-header-cell min-w-[100px] hidden xl:table-cell">Oluşturulma</th>
                <th className="table-header-cell text-right min-w-[200px]">İşlemler</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    {t('users.noUsers')}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="text-sm font-medium text-gray-900 truncate" title={user.username}>
                        {user.username}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-600 truncate" title={user.fullName}>
                        {user.fullName}
                      </div>
                    </td>
                    <td className="table-cell hidden lg:table-cell">
                      <div className="text-sm text-gray-600 truncate" title={user.email}>
                        {user.email}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${roleColors[user.role] || 'badge-gray'}`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <div className="text-sm text-gray-600 truncate" title={user.branch?.name || '-'}>
                        {user.branch?.name || '-'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="table-cell hidden xl:table-cell">
                      <div className="text-sm text-gray-600">{formatDate(user.createdAt)}</div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => onEdit(user)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setPermissionModalOpen(true);
                          }}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap flex items-center gap-1"
                          title="Yetki Yönetimi"
                        >
                          <span>🔐</span>
                          <span>Yetkiler</span>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
                          disabled={deleteUser.isLoading}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Toplam {pagination.total} kullanıcı, Sayfa {pagination.page} / {pagination.totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}

      {/* Permission Manager Modal */}
      <Modal
        isOpen={permissionModalOpen}
        onClose={() => {
          setPermissionModalOpen(false);
          setSelectedUserId(null);
        }}
        title={t('users.permissions.title')}
        size="lg"
      >
        {selectedUserId && (
          <PermissionManager
            userId={selectedUserId}
            onClose={() => {
              setPermissionModalOpen(false);
              setSelectedUserId(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default UserList;

