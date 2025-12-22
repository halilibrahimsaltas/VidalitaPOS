import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { useRootCategories } from '../../hooks/useCategories';
import { productService } from '../../services/product.service';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/currency';

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
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {t('errors.loadProducts')}
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
              placeholder={t('products.searchPlaceholder')}
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
            <option value="">{t('common.all')}</option>
            <option value="true">{t('common.active')}</option>
            <option value="false">{t('common.inactive')}</option>
          </select>
          <div>
            <Button onClick={() => setIsImportModalOpen(true)} variant="outline">
              📥 {t('products.import')}
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
                  {t('products.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('products.barcode')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('products.category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('products.price')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('products.status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('products.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {t('products.noProducts')}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.sku && (
                        <div className="text-sm text-gray-500">{t('products.sku')}: {product.sku}</div>
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
                        {formatCurrency(parseFloat(product.price), product.currency || 'UZS')}
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
                        {product.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEdit(product)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteProduct.isLoading}
                      >
                        {t('common.delete')}
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
            {t('products.paginationTotal', { total: pagination.total, page: pagination.page, totalPages: pagination.totalPages })}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              {t('common.next')}
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
        title={t('products.importTitle')}
        size="lg"
      >
        <div className="space-y-4">
          {!importResult ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">{t('products.importCSVFormat')}</h3>
                <p className="text-sm text-blue-700 mb-2">
                  {t('products.importCSVColumns')}
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside">
                  <li><strong>{t('products.importColumnName')}</strong></li>
                  <li><strong>{t('products.importColumnPrice')}</strong></li>
                  <li><strong>{t('products.importColumnDescription')}</strong></li>
                  <li><strong>{t('products.importColumnBarcode')}</strong></li>
                  <li><strong>{t('products.importColumnSku')}</strong></li>
                  <li><strong>{t('products.importColumnCategoryId')}</strong></li>
                  <li><strong>{t('products.importColumnCostPrice')}</strong></li>
                  <li><strong>{t('products.importColumnIsActive')}</strong></li>
                </ul>
                <Button
                  onClick={async () => {
                    try {
                      await productService.downloadTemplate();
                    } catch (error) {
                      alert(t('products.importTemplateError') + ': ' + (error.response?.data?.message || error.message));
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  {t('products.importTemplateDownload')}
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.importFileSelect')}
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
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    if (!importFile) {
                      alert(t('products.importFileRequired'));
                      return;
                    }

                    setIsImporting(true);
                    try {
                      const result = await productService.importProducts(importFile);
                      setImportResult(result.data);
                      refetch(); // Refresh product list
                    } catch (error) {
                      alert(t('products.importFailed') + ': ' + (error.response?.data?.message || error.message));
                    } finally {
                      setIsImporting(false);
                    }
                  }}
                  disabled={!importFile || isImporting}
                >
                  {isImporting ? t('products.importing') : t('products.import')}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">{t('products.importCompleted')}</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>{t('products.importTotal')}: {importResult.total} {t('products.name')}</p>
                  <p>{t('products.importSuccess')}: {importResult.success} {t('products.name')}</p>
                  {importResult.failed > 0 && (
                    <p className="text-red-700">{t('products.importFailedCount')}: {importResult.failed} {t('products.name')}</p>
                  )}
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h4 className="font-semibold text-red-800 mb-2">{t('products.importErrors')}</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>
                        <strong>{error.product}:</strong> {error.error}
                      </li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li className="text-gray-600">
                        {t('products.importMoreErrors', { count: importResult.errors.length - 10 })}
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
                  {t('common.close')}
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

