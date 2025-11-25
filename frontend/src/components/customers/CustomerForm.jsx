import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const CustomerForm = ({ customer, onSubmit, onCancel, isLoading }) => {
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
      newErrors.name = 'Müşteri adı gereklidir';
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
        label="Müşteri Adı"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="Örn: Ahmet Yılmaz"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          placeholder="musteri@example.com"
        />
      </div>

      <Input
        label="Adres"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        placeholder="Müşteri adresi"
      />

      <Input
        label="Vergi Numarası"
        name="taxNumber"
        value={formData.taxNumber}
        onChange={handleChange}
        error={errors.taxNumber}
        placeholder="Vergi numarası"
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
          {isLoading ? 'Kaydediliyor...' : customer ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;

