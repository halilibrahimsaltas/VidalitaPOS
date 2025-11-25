import { useState } from 'react';
import { useLowStockItems } from '../hooks/useInventory';
import InventoryList from '../components/inventory/InventoryList';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

const Inventory = () => {
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: lowStockData } = useLowStockItems();
  const lowStockItems = lowStockData?.data || [];

  const handleAdjust = (item) => {
    setSelectedItem(item);
    setIsAdjustModalOpen(true);
  };

  const handleTransfer = () => {
    setIsTransferModalOpen(true);
  };

  const handleClose = () => {
    setIsAdjustModalOpen(false);
    setIsTransferModalOpen(false);
    setSelectedItem(null);
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

        <InventoryList onAdjust={handleAdjust} onTransfer={handleTransfer} />

        {/* Stock Adjustment Modal - Placeholder */}
        {isAdjustModalOpen && (
          <Modal isOpen={isAdjustModalOpen} onClose={handleClose} title="Stok Düzeltme" size="md">
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Stok düzeltme formu yakında eklenecek.
              </p>
              <p className="text-sm text-gray-500">
                Seçili ürün: {selectedItem?.product?.name}
              </p>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleClose} variant="secondary">
                  Kapat
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Stock Transfer Modal - Placeholder */}
        {isTransferModalOpen && (
          <Modal isOpen={isTransferModalOpen} onClose={handleClose} title="Stok Transferi" size="lg">
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Stok transferi formu yakında eklenecek.
              </p>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleClose} variant="secondary">
                  Kapat
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Inventory;

