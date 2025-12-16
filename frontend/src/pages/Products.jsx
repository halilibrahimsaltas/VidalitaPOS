import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '../components/layout/PageLayout';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

const Products = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          data: formData,
        });
      } else {
        await createProduct.mutateAsync(formData);
      }
      handleClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const isLoading = createProduct.isLoading || updateProduct.isLoading;

  return (
    <PageLayout
      title={t('products.title')}
      description={t('products.subtitle')}
      actions={
        <Button variant="primary" onClick={handleCreate}>
          {t('products.create')}
        </Button>
      }
    >
        <ProductList onEdit={handleEdit} />

        <Modal
          isOpen={isModalOpen}
          onClose={handleClose}
          title={editingProduct ? t('products.edit') : t('products.create')}
          size="lg"
        >
          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
          />
        </Modal>
    </PageLayout>
  );
};

export default Products;

