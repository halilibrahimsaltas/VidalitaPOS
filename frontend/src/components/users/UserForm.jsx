import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import { useBranches } from '../../hooks/useBranches';

const UserForm = ({ user, onSubmit, onCancel, isLoading }) => {
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
      newErrors.username = 'Kullanıcı adı gereklidir';
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      newErrors.username = 'Kullanıcı adı 3 ile 50 karakter arasında olmalıdır';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi girin';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ad soyad gereklidir';
    } else if (formData.fullName.length < 2 || formData.fullName.length > 100) {
      newErrors.fullName = 'Ad soyad 2 ile 100 karakter arasında olmalıdır';
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
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MANAGER', label: 'Yönetici' },
    { value: 'USER', label: 'Kullanıcı' },
    { value: 'CASHIER', label: 'Kasiyer' },
  ];

  const branchOptions = [
    { value: '', label: 'Şube Seçiniz (Opsiyonel)' },
    ...branches.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Kullanıcı Adı"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        required
        placeholder="Örn: john_doe"
        disabled={!!user} // Disable username when editing
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        placeholder="ornek@email.com"
      />

      <Input
        label={user ? 'Yeni Şifre (Boş bırakılırsa değiştirilmez)' : 'Şifre'}
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required={!user}
        placeholder="En az 6 karakter"
      />

      <Input
        label="Ad Soyad"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        required
        placeholder="Örn: John Doe"
      />

      <Select
        label="Rol"
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={roleOptions}
        required
      />

      <Select
        label="Şube (Opsiyonel)"
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
          Aktif Kullanıcı
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          İptal
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Kaydediliyor...' : user ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

