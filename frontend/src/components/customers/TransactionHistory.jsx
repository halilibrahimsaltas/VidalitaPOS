import { useTranslation } from 'react-i18next';
import { useCustomerTransactions, useCustomerDebt } from '../../hooks/useCustomers';
import { formatCurrency } from '../../utils/currency';

const TransactionHistory = ({ customerId, onClose }) => {
  const { t } = useTranslation();
  const { data: transactionsData, isLoading } = useCustomerTransactions(customerId);
  const { data: debtData } = useCustomerDebt(customerId);

  const transactions = transactionsData?.data?.transactions || [];
  const debt = debtData?.data?.debt || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debt Summary */}
      <div className={`p-4 rounded-lg border-2 ${
        debt > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex justify-between items-center">
          <span className="font-semibold">{t('customers.totalDebt')}:</span>
          <span className={`text-lg font-bold ${debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(debt, 'UZS')}
          </span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.transactionType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.description')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.amount')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    {t('customers.noTransactions')}
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleTimeString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.type === 'SALE'
                            ? 'bg-blue-100 text-blue-800'
                            : transaction.type === 'PAYMENT'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {transaction.type === 'SALE' ? t('customers.transactionTypeLabels.SALE') : 
                         transaction.type === 'PAYMENT' ? t('customers.transactionTypeLabels.PAYMENT') : 
                         t('customers.transactionTypeLabels.ADJUSTMENT')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {transaction.description || '-'}
                      </div>
                      {transaction.sale && (
                        <div className="text-sm text-gray-500">
                          {t('customers.receipt')} {transaction.sale.saleNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div
                        className={`text-sm font-medium ${
                          transaction.type === 'SALE'
                            ? 'text-red-600'
                            : transaction.type === 'PAYMENT'
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {transaction.type === 'SALE' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount), 'UZS')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;

