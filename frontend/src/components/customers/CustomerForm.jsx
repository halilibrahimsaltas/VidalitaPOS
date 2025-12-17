import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Button from '../common/Button';

const CustomerForm = ({ customer, onSubmit, onCancel, isLoading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        taxNumber: customer.taxNumber || '',
        isActive: customer.isActive !== undefined ? customer.isActive : true,
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('customers.form.nameRequired');
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('customers.form.invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('customers.name')}
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder={t('customers.form.namePlaceholder')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('customers.phone')}
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder={t('customers.form.phonePlaceholder')}
        />

        <Input
          label={t('customers.email')}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder={t('customers.form.emailPlaceholder')}
        />
      </div>

      <Input
        label={t('customers.address')}
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        placeholder={t('customers.form.addressPlaceholder')}
      />

      <Input
        label={t('customers.taxNumber')}
        name="taxNumber"
        value={formData.taxNumber}
        onChange={handleChange}
        error={errors.taxNumber}
        placeholder={t('customers.form.taxNumberPlaceholder')}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          {t('common.active')}
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? t('common.saving') : customer ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;

