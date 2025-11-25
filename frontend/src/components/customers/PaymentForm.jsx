import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const PaymentForm = ({ customer, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Geçerli bir tutar girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        amount: parseFloat(formData.amount),
        description: formData.description || null,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600">Müşteri:</p>
        <p className="font-semibold">{customer.name}</p>
        {customer.debt > 0 && (
          <p className="text-sm text-red-600 mt-1">
            Mevcut Borç: ₺{customer.debt.toFixed(2)}
          </p>
        )}
      </div>

      <Input
        label="Ödeme Tutarı"
        name="amount"
        type="number"
        step="0.01"
        min="0.01"
        value={formData.amount}
        onChange={handleChange}
        error={errors.amount}
        required
        placeholder="0.00"
        autoFocus
      />

      <Input
        label="Açıklama (Opsiyonel)"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Ödeme açıklaması"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          İptal
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Kaydediliyor...' : 'Ödemeyi Kaydet'}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;

