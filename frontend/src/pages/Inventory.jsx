import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLowStockItems } from '../hooks/useInventory';
import PageLayout from '../components/layout/PageLayout';
import InventoryList from '../components/inventory/InventoryList';
import InventoryEditModal from '../components/inventory/InventoryEditModal';
import StockTransferModal from '../components/inventory/StockTransferModal';
import StockAdjustmentModal from '../components/inventory/StockAdjustmentModal';

const Inventory = () => {
  const { t } = useTranslation();
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
    <PageLayout
      title={t('inventory.title')}
      description={t('inventory.subtitle')}
    >
        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  {t('inventory.lowStockAlert')}
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {lowStockItems.length} {t('inventory.lowStockCount')}
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
    </PageLayout>
  );
};

export default Inventory;

