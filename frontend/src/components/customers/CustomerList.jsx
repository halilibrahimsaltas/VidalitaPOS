import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomers, useDeleteCustomer } from '../../hooks/useCustomers';
import Button from '../common/Button';
import Input from '../common/Input';

const CustomerList = ({ onEdit, onCreate, onViewTransactions, onRecordPayment, onViewStatistics, onViewPurchaseHistory }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');

  const { data, isLoading, error } = useCustomers({
    page,
    limit: 10,
    search: search || undefined,
    isActive: isActiveFilter || undefined,
  });

  const deleteCustomer = useDeleteCustomer();

  const handleDelete = async (id, name) => {
    if (window.confirm(`"${name}" ${t('customers.deleteConfirm')}`)) {
      try {
        await deleteCustomer.mutateAsync(id);
        alert(t('common.success'));
      } catch (error) {
        alert(error.response?.data?.message || t('errors.deleteCustomer'));
      }
    }
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
        {t('errors.loadCustomers')}
      </div>
    );
  }

  const { customers, pagination } = data?.data || { customers: [], pagination: {} };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Müşteri adı, telefon veya email ile ara..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
          + Yeni Müşteri
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borç
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
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Müşteri bulunamadı
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      {customer.taxNumber && (
                        <div className="text-sm text-gray-500">VKN: {customer.taxNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{customer.phone || '-'}</div>
                      <div className="text-sm text-gray-500">{customer.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${
                          customer.debt > 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        ₺{customer.debt?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {customer.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onViewStatistics(customer)}
                          className="text-purple-600 hover:text-purple-900"
                          title="İstatistikler"
                        >
                          📊
                        </button>
                        <button
                          onClick={() => onViewPurchaseHistory(customer)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Satın Alma Geçmişi"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => onViewTransactions(customer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Hareketler
                        </button>
                        {customer.debt > 0 && (
                          <button
                            onClick={() => onRecordPayment(customer)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Ödeme
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(customer)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteCustomer.isLoading}
                        >
                          Sil
                        </button>
                      </div>
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
            Toplam {pagination.total} müşteri, Sayfa {pagination.page} / {pagination.totalPages}
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

export default CustomerList;

