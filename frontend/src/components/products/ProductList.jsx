import { useState } from 'react';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { useRootCategories } from '../../hooks/useCategories';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

const ProductList = ({ onEdit, onCreate }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');

  const { data: categoriesData } = useRootCategories();
  const categories = categoriesData?.data || [];

  const { data, isLoading, error } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
    categoryId: categoryFilter || undefined,
    isActive: isActiveFilter || undefined,
  });

  const deleteProduct = useDeleteProduct();

  const handleDelete = async (id, name) => {
    if (window.confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) {
      try {
        await deleteProduct.mutateAsync(id);
        alert('Ürün başarıyla silindi');
      } catch (error) {
        alert(error.response?.data?.message || 'Ürün silinirken bir hata oluştu');
      }
    }
  };

  // Flatten categories for select
  const flattenCategories = (cats) => {
    let result = [{ value: '', label: 'Tüm Kategoriler' }];
    cats.forEach((cat) => {
      result.push({
        value: cat.id,
        label: cat.name,
      });
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach((child) => {
          result.push({
            value: child.id,
            label: `  ${child.name}`,
          });
        });
      }
    });
    return result;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Ürünler yüklenirken bir hata oluştu
      </div>
    );
  }

  const { products, pagination } = data?.data || { products: [], pagination: {} };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Ürün adı, barkod veya SKU ile ara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              options={flattenCategories(categories)}
            />
          </div>
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tümü</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
          <Button onClick={onCreate} variant="primary">
            + Yeni Ürün
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barkod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Ürün bulunamadı
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.sku && (
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">{product.barcode || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {product.category?.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₺{parseFloat(product.price).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEdit(product)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteProduct.isLoading}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Toplam {pagination.total} ürün, Sayfa {pagination.page} / {pagination.totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;

