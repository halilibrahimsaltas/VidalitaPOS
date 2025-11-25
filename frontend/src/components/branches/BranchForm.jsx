import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const BranchForm = ({ branch, onSubmit, onCancel, isLoading }) => {
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
      newErrors.name = 'Şube adı gereklidir';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Şube kodu gereklidir';
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      newErrors.code = 'Şube kodu sadece büyük harf, rakam, tire ve alt çizgi içerebilir';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi girin';
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
        label="Şube Adı"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="Örn: Merkez Şube"
      />

      <Input
        label="Şube Kodu"
        name="code"
        value={formData.code}
        onChange={handleChange}
        error={errors.code}
        required
        placeholder="Örn: MERKEZ-01"
        className="uppercase"
      />

      <Input
        label="Adres"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        placeholder="Şube adresi"
      />

      <Input
        label="Telefon"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        placeholder="+90 555 123 4567"
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="sube@example.com"
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
          Aktif
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          İptal
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Kaydediliyor...' : branch ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
};

export default BranchForm;

