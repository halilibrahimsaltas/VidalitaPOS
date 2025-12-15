import { useState, useEffect } from 'react';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useBranches } from '../../hooks/useBranches';
import { useProducts } from '../../hooks/useProducts';
import { useCreateStockAdjustment } from '../../hooks/useStockAdjustments';
import { useInventoryByBranch } from '../../hooks/useInventory';

const StockAdjustmentModal = ({ isOpen, onClose, inventoryItem, onSuccess }) => {
  const { data: branchesData } = useBranches({ limit: 100, isActive: true });
  const branches = branchesData?.data?.branches || [];
  const createAdjustment = useCreateStockAdjustment();

  const [formData, setFormData] = useState({
    branchId: '',
    productId: '',
    quantity: '',
    reason: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductSearch, setSelectedProductSearch] = useState('');

  // Get inventory from selected branch
  const { data: inventoryData } = useInventoryByBranch(formData.branchId);
  const branchInventory = inventoryData?.data || [];

  // Get products for search
  const { data: productsData } = useProducts({ limit: 50, search: selectedProductSearch });
  const products = productsData?.data?.products || [];

  useEffect(() => {
    if (inventoryItem && isOpen) {
      setFormData({
        branchId: inventoryItem.branchId || '',
        productId: inventoryItem.productId || '',
        quantity: '',
        reason: '',
        notes: '',
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({ branchId: '', productId: '', quantity: '', reason: '', notes: '' });
      setErrors({});
      setSearchTerm('');
      setSelectedProductSearch('');
    }
  }, [inventoryItem, isOpen]);

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

  const validate = () => {
    const newErrors = {};

    if (!formData.branchId) {
      newErrors.branchId = 'Şube seçimi gereklidir';
    }

    if (!formData.productId) {
      newErrors.productId = 'Ürün seçimi gereklidir';
    }

    if (!formData.quantity || parseInt(formData.quantity) === 0) {
      newErrors.quantity = 'Miktar gereklidir (pozitif veya negatif)';
    }

    // Check if inventory exists
    if (formData.branchId && formData.productId) {
      const inventoryItem = branchInventory.find(
        (inv) => inv.productId === formData.productId
      );
      if (!inventoryItem) {
        newErrors.productId = 'Bu ürün için stok kaydı bulunamadı. Önce stok oluşturun.';
      } else {
        // Check if adjustment would result in negative stock
        const currentQty = inventoryItem.quantity;
        const adjustmentQty = parseInt(formData.quantity) || 0;
        if (currentQty + adjustmentQty < 0) {
          newErrors.quantity = `Bu düzeltme stoku negatif yapar. Mevcut stok: ${currentQty}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await createAdjustment.mutateAsync({
          branchId: formData.branchId,
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
          reason: formData.reason || null,
          notes: formData.notes || null,
        });
        if (onSuccess) onSuccess();
        onClose();
      } catch (error) {
        alert(error.response?.data?.message || 'Stok düzeltmesi oluşturulurken bir hata oluştu');
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

  const getCurrentQuantity = () => {
    if (!formData.branchId || !formData.productId) return null;
    const invItem = branchInventory.find((inv) => inv.productId === formData.productId);
    return invItem?.quantity || null;
  };

  const getNewQuantity = () => {
    const current = getCurrentQuantity();
    if (current === null) return null;
    const adjustment = parseInt(formData.quantity) || 0;
    return current + adjustment;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stok Düzeltmesi"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Şube"
          name="branchId"
          value={formData.branchId}
          onChange={handleChange}
          error={errors.branchId}
          required
          disabled={!!inventoryItem} // Disable if editing from inventory item
          options={[
            { value: '', label: 'Şube Seçiniz' },
            ...branchOptions,
          ]}
        />

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
            disabled={!!inventoryItem?.productId}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2 disabled:bg-gray-100"
          />
          {searchTerm && !inventoryItem?.productId && (
            <select
              value={formData.productId}
              onChange={(e) => {
                handleChange({ target: { name: 'productId', value: e.target.value } });
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
          {!searchTerm && formData.productId && (
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
              {products.find((p) => p.id === formData.productId)?.name || inventoryItem?.product?.name || 'Ürün seçiniz'}
            </div>
          )}
          {errors.productId && (
            <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
          )}
          {getCurrentQuantity() !== null && (
            <p className="mt-1 text-xs text-gray-500">
              Mevcut stok: {getCurrentQuantity()}
            </p>
          )}
        </div>

        <div>
          <Input
            label="Miktar Değişikliği"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            error={errors.quantity}
            required
            placeholder="Pozitif: Artış, Negatif: Azalış"
          />
          <p className="mt-1 text-xs text-gray-500">
            Pozitif değer stok artışı, negatif değer stok azalışı yapar
          </p>
          {getNewQuantity() !== null && formData.quantity && (
            <p className="mt-1 text-sm font-medium text-gray-700">
              Yeni stok: {getNewQuantity()}
            </p>
          )}
        </div>

        <Input
          label="Sebep (Opsiyonel)"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          error={errors.reason}
          placeholder="Örn: Sayım farkı, Fire, Hediye, vb."
        />

        <Input
          label="Notlar (Opsiyonel)"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          error={errors.notes}
          placeholder="Ek açıklamalar..."
        />

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createAdjustment.isLoading}>
            İptal
          </Button>
          <Button type="submit" variant="primary" disabled={createAdjustment.isLoading}>
            {createAdjustment.isLoading ? 'Kaydediliyor...' : 'Düzeltme Oluştur'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StockAdjustmentModal;

