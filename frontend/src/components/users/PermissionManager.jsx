import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissions, useUserPermissions, useUpdateUserPermissions } from '../../hooks/usePermissions';
import Button from '../common/Button';

const PermissionManager = ({ userId, onClose }) => {
  const { t } = useTranslation();
  const { data: allPermissionsData, isLoading: permissionsLoading, error: permissionsError } = usePermissions();
  const { data: userPermissionsData, isLoading: userPermissionsLoading, error: userPermissionsError } = useUserPermissions(userId);
  const updatePermissions = useUpdateUserPermissions();

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});

  // Extract permissions from API response
  const allPermissions = allPermissionsData?.data || [];
  const userPermissions = userPermissionsData?.data || [];

  useEffect(() => {
    if (allPermissions && allPermissions.length > 0) {
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
    if (userPermissions && userPermissions.length > 0) {
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
      alert(error.response?.data?.message || t('users.permissions.updateError'));
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('');

  const moduleLabels = {
    users: t('users.permissions.modules.users'),
    branches: t('users.permissions.modules.branches'),
    products: t('users.permissions.modules.products'),
    inventory: t('users.permissions.modules.inventory'),
    sales: t('users.permissions.modules.sales'),
    customers: t('users.permissions.modules.customers'),
    reports: t('users.permissions.modules.reports'),
    dashboard: t('users.permissions.modules.dashboard'),
    pos: t('users.permissions.modules.pos'),
  };

  const actionLabels = {
    view: t('users.permissions.actions.view'),
    create: t('users.permissions.actions.create'),
    update: t('users.permissions.actions.update'),
    delete: t('users.permissions.actions.delete'),
    manage_permissions: t('users.permissions.actions.manage_permissions'),
    transfer: t('inventory.transfer.title'),
    adjust: t('inventory.adjust.title'),
    refund: t('users.permissions.actions.refund'),
    cancel: t('users.permissions.cancel'),
    view_detail: t('sales.detail'),
    view_invoice: t('users.permissions.actions.view_invoice'),
    view_history: t('customers.transactionHistory'),
    manage_payments: t('customers.recordPayment'),
    view_statistics: t('customers.statistics'),
    cash_register: t('reports.endOfDay'),
    sales: t('reports.title'),
    export: t('common.export', { defaultValue: 'Dışa Aktar' }),
    use: t('users.permissions.actions.use'),
    apply_discount: t('pos.discount', { defaultValue: 'İndirim Uygula' }),
  };

  // Filter permissions based on search and module
  const filteredGroupedPermissions = Object.keys(groupedPermissions).reduce((acc, module) => {
    if (selectedModule && module !== selectedModule) {
      return acc;
    }
    
    const modulePermissions = groupedPermissions[module].filter((perm) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        perm.name.toLowerCase().includes(searchLower) ||
        perm.description?.toLowerCase().includes(searchLower) ||
        perm.code.toLowerCase().includes(searchLower)
      );
    });

    if (modulePermissions.length > 0) {
      acc[module] = modulePermissions;
    }
    return acc;
  }, {});

  if (permissionsLoading || userPermissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('users.permissions.loading')}</div>
      </div>
    );
  }

  if (permissionsError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">{t('users.permissions.loadError')}</p>
        <p className="text-sm mt-1">{permissionsError.response?.data?.message || permissionsError.message}</p>
        <p className="text-xs mt-2 text-red-600">
          {t('users.permissions.adminNote')}
        </p>
      </div>
    );
  }

  if (userPermissionsError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">{t('users.permissions.userLoadError')}</p>
        <p className="text-sm mt-1">{userPermissionsError.response?.data?.message || userPermissionsError.message}</p>
      </div>
    );
  }

  if (!allPermissions || allPermissions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">{t('users.permissions.noPermissions')}</p>
        <p className="text-sm mt-1">{t('users.permissions.seedMessage')}: <code className="bg-yellow-100 px-2 py-1 rounded">npx prisma db seed</code></p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        {t('users.permissions.description')}
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.permissions.searchLabel')}</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('users.permissions.searchPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.permissions.filterLabel')}</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('users.permissions.allModules')}</option>
            {Object.keys(groupedPermissions).map((module) => (
              <option key={module} value={module}>
                {moduleLabels[module] || module}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Count */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {t('users.permissions.selectedCountLabel')}:
          </span>
          <span className="text-lg font-bold text-blue-900">
            {selectedPermissions.length} / {allPermissions.length}
          </span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.keys(filteredGroupedPermissions).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || selectedModule ? t('users.permissions.noResults') : t('users.permissions.noPermissionsFound')}
          </div>
        ) : (
          Object.keys(filteredGroupedPermissions).map((module) => {
            const modulePermissions = filteredGroupedPermissions[module];
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
                      {t('users.permissions.selectAll')}
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
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {permission.name}
                          </span>
                          <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                            {permission.code}
                          </span>
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
          })
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={updatePermissions.isLoading}
        >
          {t('users.permissions.cancel')}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={updatePermissions.isLoading || selectedPermissions.length === 0}
        >
          {updatePermissions.isLoading ? t('users.permissions.saving') : t('users.permissions.save')}
        </Button>
      </div>
    </div>
  );
};

export default PermissionManager;

