import { useState } from 'react';
import { useLowStockItems } from '../hooks/useInventory';
import InventoryList from '../components/inventory/InventoryList';
import InventoryEditModal from '../components/inventory/InventoryEditModal';
import StockTransferModal from '../components/inventory/StockTransferModal';
import StockAdjustmentModal from '../components/inventory/StockAdjustmentModal';

const Inventory = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: lowStockData } = useLowStockItems();
  const lowStockItems = lowStockData?.data || [];

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleTransfer = () => {
    setIsTransferModalOpen(true);
  };

  const handleAdjust = (item) => {
    setSelectedItem(item);
    setIsAdjustmentModalOpen(true);
  };

  const handleClose = () => {
    setIsEditModalOpen(false);
    setIsTransferModalOpen(false);
    setIsAdjustmentModalOpen(false);
    setSelectedItem(null);
  };

  const handleEditSuccess = () => {
    // Inventory list will automatically refetch due to query invalidation
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Stok Yönetimi</h1>
          <p className="mt-2 text-sm text-gray-600">
            Stok durumunu görüntüleyin ve yönetin
          </p>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  ⚠️ Düşük Stok Uyarısı
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {lowStockItems.length} ürün minimum stok seviyesinin altında
                </p>
              </div>
            </div>
          </div>
        )}

        <InventoryList onEdit={handleEdit} onTransfer={handleTransfer} onAdjust={handleAdjust} />

        {/* Inventory Edit Modal */}
        <InventoryEditModal
          isOpen={isEditModalOpen}
          onClose={handleClose}
          inventoryItem={selectedItem}
          onSuccess={handleEditSuccess}
        />

        {/* Stock Transfer Modal */}
        <StockTransferModal
          isOpen={isTransferModalOpen}
          onClose={handleClose}
          onSuccess={handleEditSuccess}
        />

        {/* Stock Adjustment Modal */}
        <StockAdjustmentModal
          isOpen={isAdjustmentModalOpen}
          onClose={handleClose}
          inventoryItem={selectedItem}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  );
};

export default Inventory;

