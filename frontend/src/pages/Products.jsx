import { useState } from 'react';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import Modal from '../components/common/Modal';

const Products = () => {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ürünleri görüntüleyin, oluşturun ve yönetin
          </p>
        </div>

        <ProductList onEdit={handleEdit} onCreate={handleCreate} />

        <Modal
          isOpen={isModalOpen}
          onClose={handleClose}
          title={editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Oluştur'}
          size="lg"
        >
          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Products;

