import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { useRootCategories } from '../../hooks/useCategories';
import { productService } from '../../services/product.service';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';

const ProductList = ({ onEdit }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const { data: categoriesData } = useRootCategories();
  const categories = categoriesData?.data || [];

  const { data, isLoading, error, refetch } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
    categoryId: categoryFilter || undefined,
    isActive: isActiveFilter || undefined,
  });

  const deleteProduct = useDeleteProduct();

  const handleDelete = async (id, name) => {
    if (window.confirm(`"${name}" ${t('products.deleteConfirm')}`)) {
      try {
        await deleteProduct.mutateAsync(id);
        alert(t('common.success'));
      } catch (error) {
        alert(error.response?.data?.message || t('errors.deleteProduct'));
      }
    }
  };

  // Flatten categories for select
  const flattenCategories = (cats) => {
    let result = [{ value: '', label: t('products.allCategories') }];
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
          <div>
            <Button onClick={() => setIsImportModalOpen(true)} variant="outline">
              📥 İçe Aktar
            </Button>
          </div>
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

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportFile(null);
          setImportResult(null);
        }}
        title="Ürün İçe Aktarma"
        size="lg"
      >
        <div className="space-y-4">
          {!importResult ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">CSV Formatı</h3>
                <p className="text-sm text-blue-700 mb-2">
                  CSV dosyanız şu sütunları içermelidir:
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside">
                  <li><strong>name</strong> (zorunlu) - Ürün adı</li>
                  <li><strong>price</strong> (zorunlu) - Satış fiyatı</li>
                  <li><strong>description</strong> - Açıklama</li>
                  <li><strong>barcode</strong> - Barkod</li>
                  <li><strong>sku</strong> - Stok kodu</li>
                  <li><strong>categoryId</strong> - Kategori ID</li>
                  <li><strong>costPrice</strong> - Maliyet fiyatı</li>
                  <li><strong>isActive</strong> - Aktif (true/false)</li>
                </ul>
                <Button
                  onClick={async () => {
                    try {
                      await productService.downloadTemplate();
                    } catch (error) {
                      alert('Şablon indirilemedi: ' + (error.response?.data?.message || error.message));
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  📥 Şablon İndir
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV Dosyası Seçin
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFile(null);
                  }}
                  disabled={isImporting}
                >
                  İptal
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    if (!importFile) {
                      alert('Lütfen bir dosya seçin');
                      return;
                    }

                    setIsImporting(true);
                    try {
                      const result = await productService.importProducts(importFile);
                      setImportResult(result.data);
                      refetch(); // Refresh product list
                    } catch (error) {
                      alert('İçe aktarma başarısız: ' + (error.response?.data?.message || error.message));
                    } finally {
                      setIsImporting(false);
                    }
                  }}
                  disabled={!importFile || isImporting}
                >
                  {isImporting ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">✅ İçe Aktarma Tamamlandı</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Toplam: {importResult.total} ürün</p>
                  <p>Başarılı: {importResult.success} ürün</p>
                  {importResult.failed > 0 && (
                    <p className="text-red-700">Başarısız: {importResult.failed} ürün</p>
                  )}
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h4 className="font-semibold text-red-800 mb-2">Hatalar:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>
                        <strong>{error.product}:</strong> {error.error}
                      </li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li className="text-gray-600">
                        ... ve {importResult.errors.length - 10} hata daha
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFile(null);
                    setImportResult(null);
                  }}
                >
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProductList;

