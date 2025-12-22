import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useBranches } from '../../hooks/useBranches';
import { useCreateOrUpdateInventory } from '../../hooks/useInventory';

const InventoryEditModal = ({ isOpen, onClose, inventoryItem, onSuccess }) => {
  const { t } = useTranslation();
  const { data: branchesData } = useBranches({ limit: 100, isActive: true });
  const branches = branchesData?.data?.branches || [];
  const createOrUpdateInventory = useCreateOrUpdateInventory();

  const [formData, setFormData] = useState({
    branchId: '',
    productId: '',
    quantity: '',
    minStockLevel: '',
    maxStockLevel: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (inventoryItem) {
      setFormData({
        branchId: inventoryItem.branchId || '',
        productId: inventoryItem.productId || '',
        quantity: inventoryItem.quantity?.toString() || '0',
        minStockLevel: inventoryItem.minStockLevel?.toString() || '0',
        maxStockLevel: inventoryItem.maxStockLevel?.toString() || '',
      });
    }
  }, [inventoryItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.branchId) {
      newErrors.branchId = t('inventory.form.branchRequired');
    }

    if (!formData.productId) {
      newErrors.productId = t('inventory.form.productRequired');
    }

    if (formData.quantity === '' || parseInt(formData.quantity) < 0) {
      newErrors.quantity = t('inventory.form.quantityRequired');
    }

    if (formData.minStockLevel === '' || parseInt(formData.minStockLevel) < 0) {
      newErrors.minStockLevel = t('inventory.form.minStockRequired');
    }

    if (formData.maxStockLevel && parseInt(formData.maxStockLevel) < 0) {
      newErrors.maxStockLevel = t('inventory.form.maxStockInvalid');
    }

    if (
      formData.maxStockLevel &&
      formData.minStockLevel &&
      parseInt(formData.maxStockLevel) < parseInt(formData.minStockLevel)
    ) {
      newErrors.maxStockLevel = t('inventory.form.maxStockLessThanMin');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await createOrUpdateInventory.mutateAsync({
          branchId: formData.branchId,
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
          minStockLevel: parseInt(formData.minStockLevel),
          maxStockLevel: formData.maxStockLevel ? parseInt(formData.maxStockLevel) : null,
        });
        if (onSuccess) onSuccess();
        onClose();
      } catch (error) {
        alert(error.response?.data?.message || t('inventory.form.updateError'));
      }
    }
  };

  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={inventoryItem ? t('inventory.form.editTitle') : t('inventory.form.createTitle')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label={t('inventory.branch')}
          name="branchId"
          value={formData.branchId}
          onChange={handleChange}
          error={errors.branchId}
          required
          options={[
            { value: '', label: t('inventory.branchSelect') },
            ...branchOptions,
          ]}
          disabled={!!inventoryItem} // Disable if editing existing inventory
        />

        {inventoryItem && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.product')}</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700">
              {inventoryItem.product?.name || t('inventory.form.unknownProduct')}
            </div>
          </div>
        )}

        <Input
          label={t('inventory.quantityLabel')}
          name="quantity"
          type="number"
          min="0"
          value={formData.quantity}
          onChange={handleChange}
          error={errors.quantity}
          required
          placeholder="0"
        />

        <Input
          label={t('inventory.minStockLabel')}
          name="minStockLevel"
          type="number"
          min="0"
          value={formData.minStockLevel}
          onChange={handleChange}
          error={errors.minStockLevel}
          required
          placeholder="0"
        />

        <Input
          label={t('inventory.maxStockLabel')}
          name="maxStockLevel"
          type="number"
          min="0"
          value={formData.maxStockLevel}
          onChange={handleChange}
          error={errors.maxStockLevel}
          placeholder={t('inventory.form.maxStockPlaceholder')}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createOrUpdateInventory.isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={createOrUpdateInventory.isLoading}>
            {createOrUpdateInventory.isLoading ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InventoryEditModal;

