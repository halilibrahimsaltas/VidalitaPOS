import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { useRootCategories } from '../../hooks/useCategories';

const ProductForm = ({ product, onSubmit, onCancel, isLoading }) => {
  const { data: categoriesData } = useRootCategories();
  const categories = categoriesData?.data || [];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    categoryId: '',
    price: '',
    costPrice: '',
    imageUrl: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        barcode: product.barcode || '',
        sku: product.sku || '',
        categoryId: product.categoryId || '',
        price: product.price ? parseFloat(product.price).toFixed(2) : '',
        costPrice: product.costPrice ? parseFloat(product.costPrice).toFixed(2) : '',
        imageUrl: product.imageUrl || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
    }
  }, [product]);

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
      newErrors.name = 'Ürün adı gereklidir';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Geçerli bir fiyat girin';
    }

    if (formData.costPrice && parseFloat(formData.costPrice) < 0) {
      newErrors.costPrice = 'Maliyet fiyatı negatif olamaz';
    }

    if (formData.barcode && formData.barcode.length < 8) {
      newErrors.barcode = 'Barkod en az 8 karakter olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        categoryId: formData.categoryId || null,
        barcode: formData.barcode || null,
        sku: formData.sku || null,
      };
      onSubmit(submitData);
    }
  };

  // Flatten categories for select (including children)
  const flattenCategories = (cats, level = 0) => {
    let result = [];
    cats.forEach((cat) => {
      result.push({
        value: cat.id,
        label: '  '.repeat(level) + cat.name,
      });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
    return result;
  };

  const categoryOptions = flattenCategories(categories);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Ürün Adı"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="Örn: Coca Cola 330ml"
        />

        <Input
          label="Barkod"
          name="barcode"
          value={formData.barcode}
          onChange={handleChange}
          error={errors.barcode}
          placeholder="Otomatik oluşturulacak"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="SKU"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          error={errors.sku}
          placeholder="Stok kodu"
        />

        <Select
          label="Kategori"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          options={categoryOptions}
          error={errors.categoryId}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Satış Fiyatı"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          required
          placeholder="0.00"
        />

        <Input
          label="Maliyet Fiyatı"
          name="costPrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.costPrice}
          onChange={handleChange}
          error={errors.costPrice}
          placeholder="0.00"
        />
      </div>

      <Input
        label="Açıklama"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Ürün açıklaması"
      />

      <Input
        label="Görsel URL"
        name="imageUrl"
        type="url"
        value={formData.imageUrl}
        onChange={handleChange}
        error={errors.imageUrl}
        placeholder="https://example.com/image.jpg"
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
          {isLoading ? 'Kaydediliyor...' : product ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;

