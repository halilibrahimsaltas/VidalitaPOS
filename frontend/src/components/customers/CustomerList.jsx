import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomers, useDeleteCustomer } from '../../hooks/useCustomers';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatCurrency } from '../../utils/currency';

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
            placeholder={t('customers.searchPlaceholder')}
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
          <option value="">{t('common.all')}</option>
          <option value="true">{t('common.active')}</option>
          <option value="false">{t('common.inactive')}</option>
        </select>
        <Button onClick={onCreate} variant="primary">
          {t('customers.createNew')}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.debt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {t('customers.noCustomers')}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      {customer.taxNumber && (
                        <div className="text-sm text-gray-500">{t('customers.taxNumber')}: {customer.taxNumber}</div>
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
                        {formatCurrency(customer.debt || 0, 'UZS')}
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
                        {customer.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onViewStatistics(customer)}
                          className="text-purple-600 hover:text-purple-900"
                          title={t('customers.statistics')}
                        >
                          📊
                        </button>
                        <button
                          onClick={() => onViewPurchaseHistory(customer)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title={t('customers.purchaseHistory')}
                        >
                          📋
                        </button>
                        <button
                          onClick={() => onViewTransactions(customer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t('customers.transactions')}
                        </button>
                        {customer.debt > 0 && (
                          <button
                            onClick={() => onRecordPayment(customer)}
                            className="text-green-600 hover:text-green-900"
                          >
                            {t('customers.payment')}
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(customer)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteCustomer.isLoading}
                        >
                          {t('common.delete')}
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
            {t('customers.paginationTotal', { total: pagination.total, page: pagination.page, totalPages: pagination.totalPages })}
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
    </div>
  );
};

export default CustomerList;

