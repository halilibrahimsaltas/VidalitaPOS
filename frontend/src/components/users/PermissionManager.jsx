import { useState, useEffect } from 'react';
import { usePermissions, useUserPermissions, useUpdateUserPermissions } from '../../hooks/usePermissions';
import Button from '../common/Button';

const PermissionManager = ({ userId, onClose }) => {
  const { data: allPermissions, isLoading: permissionsLoading } = usePermissions();
  const { data: userPermissions, isLoading: userPermissionsLoading } = useUserPermissions(userId);
  const updatePermissions = useUpdateUserPermissions();

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});

  useEffect(() => {
    if (allPermissions) {
      // Group permissions by module
      const grouped = {};
      allPermissions.forEach((perm) => {
        if (!grouped[perm.module]) {
          grouped[perm.module] = [];
        }
        grouped[perm.module].push(perm);
      });
      setGroupedPermissions(grouped);
    }
  }, [allPermissions]);

  useEffect(() => {
    if (userPermissions) {
      setSelectedPermissions(userPermissions.map((p) => p.id));
    }
  }, [userPermissions]);

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleToggleModule = (module) => {
    const modulePermissions = groupedPermissions[module] || [];
    const modulePermissionIds = modulePermissions.map((p) => p.id);
    const allSelected = modulePermissionIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      // Deselect all in module
      setSelectedPermissions((prev) => prev.filter((id) => !modulePermissionIds.includes(id)));
    } else {
      // Select all in module
      setSelectedPermissions((prev) => {
        const newSelection = [...prev];
        modulePermissionIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleSave = async () => {
    try {
      await updatePermissions.mutateAsync({
        userId,
        permissionIds: selectedPermissions,
      });
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Yetkiler güncellenirken bir hata oluştu');
    }
  };

  const moduleLabels = {
    users: 'Kullanıcı Yönetimi',
    branches: 'Şube Yönetimi',
    products: 'Ürün Yönetimi',
    inventory: 'Stok Yönetimi',
    sales: 'Satış Yönetimi',
    customers: 'Müşteri Yönetimi',
    reports: 'Raporlar',
    dashboard: 'Dashboard',
  };

  const actionLabels = {
    view: 'Görüntüle',
    create: 'Oluştur',
    update: 'Güncelle',
    delete: 'Sil',
    manage_permissions: 'Yetkileri Yönet',
    transfer: 'Transfer Et',
    adjust: 'Düzelt',
    refund: 'İade Yap',
  };

  if (permissionsLoading || userPermissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Kullanıcıya verilecek yetkileri seçin. Modül bazında tüm yetkileri seçebilir veya tek tek yetki seçebilirsiniz.
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.keys(groupedPermissions).map((module) => {
          const modulePermissions = groupedPermissions[module];
          const modulePermissionIds = modulePermissions.map((p) => p.id);
          const allSelected = modulePermissionIds.every((id) => selectedPermissions.includes(id));
          const someSelected = modulePermissionIds.some((id) => selectedPermissions.includes(id));

          return (
            <div key={module} className="border border-gray-200 rounded-md p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  {moduleLabels[module] || module}
                </h3>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={() => handleToggleModule(module)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-xs text-gray-600 whitespace-nowrap">
                    Tümünü Seç
                  </span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {modulePermissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handleTogglePermission(permission.id)}
                      className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {permission.name}
                      </div>
                      {permission.description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {permission.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={updatePermissions.isLoading}
        >
          İptal
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={updatePermissions.isLoading || selectedPermissions.length === 0}
        >
          {updatePermissions.isLoading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </div>
  );
};

export default PermissionManager;

