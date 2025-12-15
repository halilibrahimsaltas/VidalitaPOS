import { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { useBranches } from '../../hooks/useBranches';
import Select from '../common/Select';
import Button from '../common/Button';

const InventoryList = ({ onEdit, onTransfer, onAdjust }) => {
  const [branchFilter, setBranchFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState('');

  const { data: branchesData } = useBranches({ limit: 100 });
  const branches = branchesData?.data?.branches || [];

  const { data, isLoading, error } = useInventory({
    branchId: branchFilter || undefined,
    lowStock: lowStockFilter || undefined,
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Stok bilgileri yüklenirken bir hata oluştu
      </div>
    );
  }

  const { inventory } = data?.data || { inventory: [] };

  const branchOptions = [
    { value: '', label: 'Tüm Şubeler' },
    ...branches.map((b) => ({ value: b.id, label: b.name })),
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <Select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            options={branchOptions}
          />
        </div>
        <select
          value={lowStockFilter}
          onChange={(e) => setLowStockFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tümü</option>
          <option value="true">Düşük Stok</option>
        </select>
        <Button onClick={onTransfer} variant="primary">
          Stok Transferi
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Şube
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mevcut Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min. Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Stok kaydı bulunamadı
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const isLowStock = item.quantity <= item.minStockLevel;
                  return (
                    <tr key={`${item.branchId}-${item.productId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.branch.name}</div>
                        <div className="text-sm text-gray-500">{item.branch.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                        {item.product.barcode && (
                          <div className="text-sm text-gray-500 font-mono">{item.product.barcode}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.minStockLevel}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isLowStock
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {isLowStock ? 'Düşük Stok' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => onEdit(item)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Düzenle
                          </button>
                          {onAdjust && (
                            <button
                              onClick={() => onAdjust(item)}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Düzelt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;

