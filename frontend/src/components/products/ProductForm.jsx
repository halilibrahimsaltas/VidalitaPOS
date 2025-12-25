import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useRootCategories, useCreateCategory } from '../../hooks/useCategories';
import { useBranches } from '../../hooks/useBranches';
import { useInventoryByProduct } from '../../hooks/useInventory';
import { useProductByBarcode } from '../../hooks/useProducts';
import { productService } from '../../services/product.service';

// Helper function to get full image URL
const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url; // Already a full URL
  
  // All uploads are served from backend
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return url.startsWith('/') ? `${apiBaseUrl}${url}` : `${apiBaseUrl}/${url}`;
};

const ProductForm = ({ product, onSubmit, onCancel, isLoading }) => {
  const { t } = useTranslation();
  const { data: categoriesData, refetch: refetchCategories } = useRootCategories();
  const categories = categoriesData?.data || [];
  const createCategory = useCreateCategory();
  const { data: branchesData } = useBranches({ limit: 100, isActive: true });
  const branches = branchesData?.data?.branches || [];
  const { data: inventoryData } = useInventoryByProduct(product?.id);
  const inventory = inventoryData?.data || [];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    categoryId: '',
    price: '',
    costPrice: '',
    currency: 'UZS',
    imageUrl: '',
    isActive: true,
    // Stock fields
    branchId: '',
    quantity: '',
    minStockLevel: '',
    maxStockLevel: '',
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParentId, setNewCategoryParentId] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [barcodeCheckTimer, setBarcodeCheckTimer] = useState(null);
  const [availableImages, setAvailableImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Check barcode uniqueness (only when creating new product or when editing and barcode is provided and changed)
  const barcodeToCheck = formData.barcode?.trim();
  const shouldCheckBarcode = barcodeToCheck && barcodeToCheck.length >= 8 && 
    (!product || barcodeToCheck !== product.barcode);
  const { data: existingBarcodeProduct, refetch: checkBarcode } = useProductByBarcode(
    shouldCheckBarcode ? barcodeToCheck : ''
  );

  // Effect to check barcode when it changes (for immediate feedback)
  useEffect(() => {
    if (shouldCheckBarcode && existingBarcodeProduct?.data) {
      if (!product || existingBarcodeProduct.data.id !== product.id) {
        setErrors((prev) => ({
          ...prev,
          barcode: `${t('products.form.barcodeDuplicate')}. ${t('products.name')}: ${existingBarcodeProduct.data.name}`,
        }));
      }
    } else if (shouldCheckBarcode && !existingBarcodeProduct) {
      // Clear error if barcode doesn't exist (for duplicate error only)
      setErrors((prev) => {
        if (prev.barcode?.includes('kullanılıyor')) {
          const newErrors = { ...prev };
          delete newErrors.barcode;
          return newErrors;
        }
        return prev;
      });
    }
  }, [existingBarcodeProduct, product, shouldCheckBarcode]);

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
        currency: product.currency || 'UZS',
        imageUrl: product.imageUrl || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
        // Stock fields - will be loaded from inventory if needed (use first inventory item)
        branchId: inventory.length > 0 ? inventory[0].branchId : '',
        quantity: inventory.length > 0 ? inventory[0].quantity?.toString() : '',
        minStockLevel: inventory.length > 0 ? inventory[0].minStockLevel?.toString() : '',
        maxStockLevel: inventory.length > 0 ? inventory[0].maxStockLevel?.toString() : '',
      });
      setImagePreview(getImageUrl(product.imageUrl || ''));
    }
  }, [product, inventory]);

  // Load available images on component mount
  useEffect(() => {
    const loadAvailableImages = async () => {
      setIsLoadingImages(true);
      try {
        const response = await productService.getAvailableImages();
        setAvailableImages(response.data || []);
      } catch (error) {
        console.error('Error loading available images:', error);
        setAvailableImages([]);
      } finally {
        setIsLoadingImages(false);
      }
    };
    loadAvailableImages();
  }, []);

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

    // Check barcode uniqueness when barcode changes (only for new products)
    if (name === 'barcode' && !product && value.trim().length >= 8) {
      // Debounce the check
      if (barcodeCheckTimer) {
        clearTimeout(barcodeCheckTimer);
      }
      const timer = setTimeout(() => {
        checkBarcode().then((result) => {
          if (result.data?.data) {
            setErrors((prev) => ({
              ...prev,
              barcode: `${t('products.form.barcodeDuplicate')}. Ürün: ${result.data.data.name}`,
            }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              if (newErrors.barcode?.includes(t('products.form.barcodeDuplicate'))) {
                delete newErrors.barcode;
              }
              return newErrors;
            });
          }
        }).catch(() => {
          // Barcode doesn't exist (404), which is good
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.barcode?.includes(t('products.form.barcodeDuplicate'))) {
              delete newErrors.barcode;
            }
            return newErrors;
          });
        });
      }, 500);
      setBarcodeCheckTimer(timer);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Sadece resim dosyaları yüklenebilir' }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Dosya boyutu 5MB\'dan küçük olmalıdır' }));
      return;
    }

    setIsUploading(true);
    setErrors((prev) => ({ ...prev, image: '' }));

    try {
      const result = await productService.uploadImage(file);
      const imageUrl = result.data.url;
      setFormData((prev) => ({ ...prev, imageUrl }));
      setImagePreview(imageUrl);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        image: error.response?.data?.message || t('products.form.imageUploadError'),
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(getImageUrl(url));
  };

  const handleImageSelect = (e) => {
    const selectedImageName = e.target.value;
    if (selectedImageName) {
      const selectedImage = availableImages.find(img => img.name === selectedImageName);
      if (selectedImage) {
        setFormData((prev) => ({ ...prev, imageUrl: selectedImage.url }));
        setImagePreview(getImageUrl(selectedImage.url));
      }
    } else {
      setFormData((prev) => ({ ...prev, imageUrl: '' }));
      setImagePreview('');
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

    if (formData.barcode && formData.barcode.trim().length > 0) {
      if (formData.barcode.trim().length < 8) {
        newErrors.barcode = 'Barkod en az 8 karakter olmalıdır';
      } else if (existingBarcodeProduct?.data && (!product || existingBarcodeProduct.data.id !== product.id)) {
        // Check for duplicate barcode (only for new products or when barcode is changed)
        newErrors.barcode = `Bu barkod numarası zaten kullanılıyor. Ürün: ${existingBarcodeProduct.data.name}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Separate inventory fields from product fields
      const { branchId, quantity, minStockLevel, maxStockLevel, ...productFields } = formData;
      
      const submitData = {
        ...productFields,
        price: parseFloat(productFields.price),
        costPrice: productFields.costPrice ? parseFloat(productFields.costPrice) : null,
        categoryId: productFields.categoryId || null,
        barcode: productFields.barcode || null,
        sku: productFields.sku || null,
        // Include inventory data if branch is selected
        inventory: branchId ? {
          branchId,
          quantity: quantity ? parseInt(quantity) : 0,
          minStockLevel: minStockLevel ? parseInt(minStockLevel) : 0,
          maxStockLevel: maxStockLevel ? parseInt(maxStockLevel) : null,
        } : undefined,
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
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('products.name')}
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder={t('products.form.namePlaceholder')}
        />

        <Input
          label={t('products.barcode')}
          name="barcode"
          value={formData.barcode}
          onChange={handleChange}
          error={errors.barcode}
          placeholder={t('products.form.barcodePlaceholder')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('products.sku')}
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          error={errors.sku}
          placeholder={t('products.form.skuPlaceholder')}
        />

        <div className="flex-1">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label={t('products.category')}
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                options={categoryOptions}
                error={errors.categoryId}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCategoryModalOpen(true)}
              className="mb-0"
            >
              {t('products.form.newCategory')}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label={t('products.price')}
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            required
            placeholder={t('products.form.pricePlaceholder')}
          />
        </div>

        <div>
          <Input
            label={t('products.costPrice')}
            name="costPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.costPrice}
            onChange={handleChange}
            error={errors.costPrice}
            placeholder={t('products.form.costPricePlaceholder')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={t('products.currency')}
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          error={errors.currency}
          options={[
            { value: 'UZS', label: t('products.currencyOptions.UZS') },
            { value: 'USD', label: t('products.currencyOptions.USD') },
            { value: 'TRY', label: t('products.currencyOptions.TRY') },
            { value: 'EUR', label: t('products.currencyOptions.EUR') },
          ]}
        />
      </div>

      <Input
        label={t('products.description')}
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder={t('products.form.descriptionPlaceholder')}
      />

      {/* Image Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('products.imageUrl')}
        </label>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              onError={() => setImagePreview('')}
            />
          </div>
        )}

        {/* Select from available images */}
        {availableImages.length > 0 && (
          <>
            <Select
              label={t('products.form.selectExistingImage')}
              name="selectedImage"
              value={availableImages.find(img => img.url === formData.imageUrl)?.name || ''}
              onChange={handleImageSelect}
              options={[
                { value: '', label: t('products.form.selectImage') },
                ...availableImages.map(img => ({
                  value: img.name,
                  label: img.name,
                })),
              ]}
              error={errors.selectedImage}
            />
            <div className="text-sm text-gray-500 mb-2">{t('common.or')}</div>
          </>
        )}

        {/* File Upload */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
            />
            {isUploading && (
              <p className="mt-1 text-sm text-gray-500">{t('common.uploading')}</p>
            )}
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>
        </div>

        {/* Or URL Input */}
        <div className="text-sm text-gray-500 mb-2">{t('common.or')}</div>
        <Input
          label={t('products.imageUrl')}
          name="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={handleImageUrlChange}
          error={errors.imageUrl}
          placeholder={t('products.form.imageUrlPlaceholder')}
        />
      </div>

      {/* Stock Information */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('products.form.stockInfo')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t('inventory.branch')}
            name="branchId"
            value={formData.branchId}
            onChange={handleChange}
            error={errors.branchId}
            options={[
              { value: '', label: t('products.form.branchSelect') },
              ...branches.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />

          <Input
            label={t('inventory.quantity')}
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            error={errors.quantity}
            placeholder={t('products.form.quantityPlaceholder')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label={t('inventory.minStock')}
            name="minStockLevel"
            type="number"
            min="0"
            value={formData.minStockLevel}
            onChange={handleChange}
            error={errors.minStockLevel}
            placeholder={t('products.form.minStockPlaceholder')}
          />

          <Input
            label="Maksimum Stok Seviyesi"
            name="maxStockLevel"
            type="number"
            min="0"
            value={formData.maxStockLevel}
            onChange={handleChange}
            error={errors.maxStockLevel}
            placeholder={t('products.form.maxStockPlaceholder')}
          />
        </div>
      </div>

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
          {isLoading ? t('common.saving') : product ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>

    {/* Category Creation Modal */}
    <Modal
      isOpen={isCategoryModalOpen}
      onClose={() => {
        setIsCategoryModalOpen(false);
        setNewCategoryName('');
        setNewCategoryParentId('');
      }}
      title={t('products.form.newCategoryTitle')}
      size="md"
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newCategoryName.trim()) {
            alert(t('products.form.categoryNameRequired'));
            return;
          }

          setIsCreatingCategory(true);
          try {
            const categoryData = {
              name: newCategoryName.trim(),
              parentId: newCategoryParentId || null,
            };
            const result = await createCategory.mutateAsync(categoryData);
            // Set the newly created category as selected
            setFormData((prev) => ({ ...prev, categoryId: result.data.id }));
            // Refresh categories
            refetchCategories();
            setIsCategoryModalOpen(false);
            setNewCategoryName('');
            setNewCategoryParentId('');
          } catch (error) {
            alert(error.response?.data?.message || t('products.form.categoryCreateError'));
          } finally {
            setIsCreatingCategory(false);
          }
        }}
        className="space-y-4"
      >
        <Input
          label={t('products.category')}
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder={t('products.form.categoryNamePlaceholder')}
          required
        />
        <Select
          label={t('products.form.parentCategory')}
          value={newCategoryParentId}
          onChange={(e) => setNewCategoryParentId(e.target.value)}
          options={[
            { value: '', label: t('products.form.rootCategory') },
            ...categoryOptions,
          ]}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsCategoryModalOpen(false);
              setNewCategoryName('');
              setNewCategoryParentId('');
            }}
            disabled={isCreatingCategory}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isCreatingCategory}>
            {isCreatingCategory ? t('products.form.creating') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
    </>
  );
};

export default ProductForm;

