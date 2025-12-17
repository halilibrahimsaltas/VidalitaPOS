import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Button from '../common/Button';

const BranchForm = ({ branch, onSubmit, onCancel, isLoading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name || '',
        code: branch.code || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        isActive: branch.isActive !== undefined ? branch.isActive : true,
      });
    }
  }, [branch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('branches.form.nameRequired');
    }

    if (!formData.code.trim()) {
      newErrors.code = t('branches.form.codeRequired');
    } else if (formData.code.trim().length > 50) {
      newErrors.code = t('branches.form.codeMaxLength');
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('branches.form.invalidEmail');
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
        label={t('branches.name')}
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder={t('branches.form.namePlaceholder')}
      />

      <Input
        label={t('branches.code')}
        name="code"
        value={formData.code}
        onChange={handleChange}
        error={errors.code}
        required
        placeholder={t('branches.form.codePlaceholder')}
        maxLength={50}
      />

      <Input
        label={t('branches.address')}
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        placeholder={t('branches.form.addressPlaceholder')}
      />

      <Input
        label={t('branches.phone')}
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        placeholder={t('branches.form.phonePlaceholder')}
      />

      <Input
        label={t('branches.email')}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder={t('branches.form.emailPlaceholder')}
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
          {isLoading ? t('common.saving') : branch ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>
  );
};

export default BranchForm;

