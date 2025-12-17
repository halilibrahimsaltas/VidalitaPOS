import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import { useBranches } from '../../hooks/useBranches';

const UserForm = ({ user, onSubmit, onCancel, isLoading }) => {
  const { t } = useTranslation();
  const { data: branchesData } = useBranches({ limit: 100, isActive: true });
  const branches = branchesData?.data?.branches || [];

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'USER',
    isActive: true,
    branchId: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '', // Don't populate password
        fullName: user.fullName || '',
        role: user.role || 'USER',
        isActive: user.isActive !== undefined ? user.isActive : true,
        branchId: user.branchId || '',
      });
    }
  }, [user]);

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

    if (!formData.username.trim()) {
      newErrors.username = t('users.form.usernameRequired');
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      newErrors.username = t('users.form.usernameLength');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = t('users.form.usernameInvalid');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('users.form.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('users.form.emailInvalid');
    }

    if (!user && !formData.password) {
      newErrors.password = t('users.form.passwordRequired');
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = t('users.form.passwordMinLength');
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('users.form.fullNameRequired');
    } else if (formData.fullName.length < 2 || formData.fullName.length > 100) {
      newErrors.fullName = t('users.form.fullNameLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = { ...formData };
      // Remove password if it's empty (for updates)
      if (user && !submitData.password) {
        delete submitData.password;
      }
      // Remove branchId if empty
      if (!submitData.branchId) {
        submitData.branchId = null;
      }
      onSubmit(submitData);
    }
  };

  const roleOptions = [
    { value: 'ADMIN', label: t('users.roles.ADMIN') },
    { value: 'MANAGER', label: t('users.roles.MANAGER') },
    { value: 'USER', label: t('users.roles.USER') },
    { value: 'CASHIER', label: t('users.roles.CASHIER') },
  ];

  const branchOptions = [
    { value: '', label: t('users.form.branchSelect') },
    ...branches.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('users.username')}
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        required
        placeholder={t('users.form.usernamePlaceholder')}
        disabled={!!user} // Disable username when editing
      />

      <Input
        label={t('users.email')}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        placeholder={t('users.form.emailPlaceholder')}
      />

      <Input
        label={user ? t('users.form.passwordLabelEdit') : t('users.form.passwordLabel')}
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required={!user}
        placeholder={t('users.form.passwordPlaceholder')}
      />

      <Input
        label={t('users.fullName')}
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        required
        placeholder={t('users.form.fullNamePlaceholder')}
      />

      <Select
        label={t('users.role')}
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={roleOptions}
        required
      />

      <Select
        label={`${t('users.branch')} (${t('common.optional')})`}
        name="branchId"
        value={formData.branchId}
        onChange={handleChange}
        options={branchOptions}
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
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          {t('users.form.activeUser')}
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? t('common.saving') : user ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

