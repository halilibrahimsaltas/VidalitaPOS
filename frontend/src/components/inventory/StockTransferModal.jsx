import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useBranches } from '../../hooks/useBranches';
import { useProducts } from '../../hooks/useProducts';
import { useCreateStockTransfer } from '../../hooks/useStockTransfers';
import { useInventoryByBranch } from '../../hooks/useInventory';

const StockTransferModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { data: branchesData } = useBranches({ limit: 100, isActive: true });
  const branches = branchesData?.data?.branches || [];
  const createTransfer = useCreateStockTransfer();

  const [formData, setFormData] = useState({
    fromBranchId: '',
    toBranchId: '',
    notes: '',
  });

  const [items, setItems] = useState([{ productId: '', quantity: '' }]);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductSearch, setSelectedProductSearch] = useState('');

  // Get inventory from source branch for validation
  const { data: inventoryData } = useInventoryByBranch(formData.fromBranchId);
  const sourceInventory = inventoryData?.data || [];

  // Get products for search
  const { data: productsData } = useProducts({ limit: 50, search: selectedProductSearch });
  const products = productsData?.data?.products || [];

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({ fromBranchId: '', toBranchId: '', notes: '' });
      setItems([{ productId: '', quantity: '' }]);
      setErrors({});
      setSearchTerm('');
      setSelectedProductSearch('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    
    // Clear item errors
    if (errors[`item_${index}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`item_${index}_${field}`];
      setErrors(newErrors);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fromBranchId) {
      newErrors.fromBranchId = 'Kaynak şube seçimi gereklidir';
    }

    if (!formData.toBranchId) {
      newErrors.toBranchId = 'Hedef şube seçimi gereklidir';
    }

    if (formData.fromBranchId === formData.toBranchId) {
      newErrors.toBranchId = 'Kaynak ve hedef şube aynı olamaz';
    }

    items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item_${index}_productId`] = 'Ürün seçimi gereklidir';
      }

      if (!item.quantity || parseInt(item.quantity) <= 0) {
        newErrors[`item_${index}_quantity`] = 'Geçerli bir miktar girin';
      }

      // Check stock availability
      if (item.productId && formData.fromBranchId) {
        const inventoryItem = sourceInventory.find(
          (inv) => inv.productId === item.productId
        );
        const requestedQty = parseInt(item.quantity) || 0;
        if (!inventoryItem || inventoryItem.quantity < requestedQty) {
          newErrors[`item_${index}_quantity`] = `Yetersiz stok. Mevcut: ${inventoryItem?.quantity || 0}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await createTransfer.mutateAsync({
          fromBranchId: formData.fromBranchId,
          toBranchId: formData.toBranchId,
          notes: formData.notes || null,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
          })),
        });
        if (onSuccess) onSuccess();
        onClose();
      } catch (error) {
        alert(error.response?.data?.message || 'Stok transferi oluşturulurken bir hata oluştu');
      }
    }
  };

  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));

  // Filter products based on search term
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchTerm)) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAvailableQuantity = (productId) => {
    const inventoryItem = sourceInventory.find((inv) => inv.productId === productId);
    return inventoryItem?.quantity || 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stok Transferi"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Kaynak Şube"
            name="fromBranchId"
            value={formData.fromBranchId}
            onChange={handleChange}
            error={errors.fromBranchId}
            required
            options={[
              { value: '', label: 'Kaynak Şube Seçiniz' },
              ...branchOptions,
            ]}
          />

          <Select
            label="Hedef Şube"
            name="toBranchId"
            value={formData.toBranchId}
            onChange={handleChange}
            error={errors.toBranchId}
            required
            options={[
              { value: '', label: 'Hedef Şube Seçiniz' },
              ...branchOptions.filter((b) => b.value !== formData.fromBranchId),
            ]}
          />
        </div>

        <Input
          label="Notlar (Opsiyonel)"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          error={errors.notes}
          placeholder="Transfer notları..."
        />

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Transfer Kalemleri</h3>
            <Button type="button" variant="secondary" onClick={addItem}>
              + Ürün Ekle
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Kalem {index + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Kaldır
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ürün
                    </label>
                    <input
                      type="text"
                      placeholder="Ürün ara (isim, barkod, SKU)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setSelectedProductSearch(searchTerm)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                    />
                    {searchTerm && (
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          handleItemChange(index, 'productId', e.target.value);
                          setSearchTerm('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Ürün Seçiniz</option>
                        {filteredProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} {product.barcode && `(${product.barcode})`}
                          </option>
                        ))}
                      </select>
                    )}
                    {!searchTerm && item.productId && (
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
                        {products.find((p) => p.id === item.productId)?.name || 'Ürün seçiniz'}
                      </div>
                    )}
                    {errors[`item_${index}_productId`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_productId`]}</p>
                    )}
                    {item.productId && formData.fromBranchId && (
                      <p className="mt-1 text-xs text-gray-500">
                        Mevcut stok: {getAvailableQuantity(item.productId)}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Miktar"
                    name={`quantity_${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    error={errors[`item_${index}_quantity`]}
                    required
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createTransfer.isLoading}>
            İptal
          </Button>
          <Button type="submit" variant="primary" disabled={createTransfer.isLoading}>
            {createTransfer.isLoading ? 'Kaydediliyor...' : 'Transfer Oluştur'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StockTransferModal;

