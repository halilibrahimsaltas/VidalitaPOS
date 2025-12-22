import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSales, useSale, useRefundSale, useCancelSale } from '../../hooks/useSales';
import { HiDocumentText } from 'react-icons/hi2';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import BranchSelect from '../common/BranchSelect';
import RefundModal from './RefundModal';
import InvoiceView from './InvoiceView';
import { formatCurrency } from '../../utils/currency';

const SalesList = () => {
  const { t } = useTranslation();
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceSaleId, setInvoiceSaleId] = useState(null);
  const [saleToRefund, setSaleToRefund] = useState(null);

  const refundSale = useRefundSale();
  const cancelSale = useCancelSale();

  const { data, isLoading, error } = useSales({
    page,
    limit: 10,
    branchId: branchFilter || undefined,
    status: statusFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: saleDetail } = useSale(selectedSaleId);

  const handleViewDetails = (saleId) => {
    setSelectedSaleId(saleId);
    setIsDetailModalOpen(true);
  };

  const handleRefund = (sale) => {
    setSaleToRefund(sale);
    setIsRefundModalOpen(true);
  };

  const handleConfirmRefund = async (refundItems) => {
    try {
      await refundSale.mutateAsync({
        id: saleToRefund.id,
        items: refundItems,
      });
      setIsRefundModalOpen(false);
      setSaleToRefund(null);
      setIsDetailModalOpen(false);
      setSelectedSaleId(null);
    } catch (error) {
      alert(error.response?.data?.message || t('sales.refundError'));
    }
  };

  const handleCancel = async (saleId) => {
    if (!window.confirm(t('sales.cancelConfirm'))) {
      return;
    }

    try {
      await cancelSale.mutateAsync(saleId);
      setIsDetailModalOpen(false);
      setSelectedSaleId(null);
    } catch (error) {
      alert(error.response?.data?.message || t('sales.cancelError'));
    }
  };

  const handleViewInvoice = (saleId) => {
    setInvoiceSaleId(saleId);
    setIsInvoiceModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get the most common currency from sale items, or default to UZS
  const getSaleCurrency = (sale) => {
    if (!sale?.items || sale.items.length === 0) return 'UZS';
    const currencies = sale.items
      .map(item => item.product?.currency || 'UZS')
      .filter(Boolean);
    if (currencies.length === 0) return 'UZS';
    const currencyCounts = {};
    currencies.forEach(curr => {
      currencyCounts[curr] = (currencyCounts[curr] || 0) + 1;
    });
    return Object.keys(currencyCounts).reduce((a, b) => 
      currencyCounts[a] > currencyCounts[b] ? a : b
    );
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
        {t('sales.loadError')}
      </div>
    );
  }

  const { sales, pagination } = data?.data || { sales: [], pagination: {} };

  const statusOptions = [
    { value: '', label: t('sales.allStatuses') },
    { value: 'COMPLETED', label: t('sales.statusLabels.COMPLETED') },
    { value: 'REFUNDED', label: t('sales.statusLabels.REFUNDED') },
    { value: 'PARTIALLY_REFUNDED', label: t('sales.statusLabels.PARTIALLY_REFUNDED') },
    { value: 'CANCELLED', label: t('sales.statusLabels.CANCELLED') },
  ];

  const paymentMethodLabels = {
    CASH: t('sales.paymentMethodLabels.CASH'),
    CARD: t('sales.paymentMethodLabels.CARD'),
    CREDIT: t('sales.paymentMethodLabels.CREDIT'),
    MIXED: t('sales.paymentMethodLabels.MIXED'),
  };

  const statusLabels = {
    COMPLETED: t('sales.statusLabels.COMPLETED'),
    REFUNDED: t('sales.statusLabels.REFUNDED'),
    PARTIALLY_REFUNDED: t('sales.statusLabels.PARTIALLY_REFUNDED'),
    CANCELLED: t('sales.statusLabels.CANCELLED'),
  };

  const statusColors = {
    COMPLETED: 'badge-success',
    REFUNDED: 'badge-warning',
    PARTIALLY_REFUNDED: 'badge-warning',
    CANCELLED: 'badge-danger',
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="space-y-4">
          {/* First row: Branch and Status - Symmetric */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="pt-6">
              <BranchSelect
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
                placeholder={t('sales.allBranches')}
                label=""
              />
            </div>
            <div className="pt-6">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                options={statusOptions}
                placeholder={t('sales.allStatuses')}
              />
            </div>
          </div>
          {/* Second row: Date inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              placeholder={t('sales.startDate')}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              placeholder={t('sales.endDate')}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell min-w-[100px]">{t('sales.saleNumber')}</th>
                <th className="table-header-cell min-w-[120px]">{t('sales.date')}</th>
                <th className="table-header-cell min-w-[120px] hidden md:table-cell">{t('sales.branch')}</th>
                <th className="table-header-cell min-w-[120px] hidden lg:table-cell">{t('sales.customer')}</th>
                <th className="table-header-cell min-w-[80px] hidden sm:table-cell">{t('sales.paymentMethod')}</th>
                <th className="table-header-cell min-w-[100px] text-right">{t('sales.total')}</th>
                <th className="table-header-cell min-w-[100px]">{t('sales.status')}</th>
                <th className="table-header-cell text-right min-w-[150px]">{t('sales.actions')}</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    {t('sales.noSales')}
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="text-sm font-medium text-gray-900 truncate" title={sale.saleNumber}>
                        {sale.saleNumber}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-600">
                        {formatDate(sale.createdAt)}
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <div className="text-sm text-gray-600 truncate" title={sale.branch?.name || '-'}>
                        {sale.branch?.name || '-'}
                      </div>
                    </td>
                    <td className="table-cell hidden lg:table-cell">
                      <div className="text-sm text-gray-600 truncate" title={sale.customer?.name || t('sales.retail')}>
                        {sale.customer?.name || t('sales.retail')}
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <div className="text-sm text-gray-600 truncate">
                        {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(parseFloat(sale.total), getSaleCurrency(sale))}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${statusColors[sale.status] || 'badge-gray'}`}>
                        {statusLabels[sale.status] || sale.status}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handleViewInvoice(sale.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap flex items-center gap-1"
                          title={t('sales.invoice')}
                        >
                          <HiDocumentText className="w-4 h-4" />
                          {t('sales.invoice')}
                        </button>
                        <button
                          onClick={() => handleViewDetails(sale.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                        >
                          {t('sales.detail')}
                        </button>
                        {sale.status === 'COMPLETED' && (
                          <>
                            <button
                              onClick={() => handleRefund(sale)}
                              className="text-sm text-gray-600 hover:text-gray-700 font-medium whitespace-nowrap"
                            >
                              {t('sales.refund')}
                            </button>
                            <button
                              onClick={() => handleCancel(sale.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
                              disabled={cancelSale.isLoading}
                            >
                              {t('sales.cancel')}
                            </button>
                          </>
                        )}
                        {sale.status === 'PARTIALLY_REFUNDED' && (
                          <button
                            onClick={() => handleRefund(sale)}
                            className="text-sm text-gray-600 hover:text-gray-700 font-medium whitespace-nowrap"
                          >
                            {t('sales.refund')}
                          </button>
                        )}
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
            {t('common.total')} {pagination.total} {t('sales.title').toLowerCase()}, {t('sales.page')} {pagination.page} {t('sales.of')} {pagination.totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t('sales.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              {t('sales.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSaleId(null);
        }}
        title={`${t('sales.detailTitle')} - ${saleDetail?.data?.saleNumber || ''}`}
        size="lg"
      >
        {saleDetail?.data ? (
          <div className="space-y-4">
            {/* Sale Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('sales.saleNumber')}</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                  {saleDetail.data.saleNumber}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('sales.date')}</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatDate(saleDetail.data.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('sales.branch')}</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                  {saleDetail.data.branch?.name || '-'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('sales.cashier')}</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                  {saleDetail.data.cashier?.fullName || saleDetail.data.cashier?.username || '-'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('sales.customer')}</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                  {saleDetail.data.customer?.name || t('sales.retail')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('sales.paymentMethodLabel')}</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                  {paymentMethodLabels[saleDetail.data.paymentMethod] || saleDetail.data.paymentMethod}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('sales.status')}</label>
                <div className="mt-1">
                  <span className={`badge ${statusColors[saleDetail.data.status] || 'badge-gray'}`}>
                    {statusLabels[saleDetail.data.status] || saleDetail.data.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-4 flex justify-between items-center">
              <Button
                variant="primary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleViewInvoice(saleDetail.data.id);
                }}
              >
                <HiDocumentText className="w-4 h-4 mr-2" />
                {t('sales.viewInvoice')}
              </Button>
              {saleDetail.data.status === 'COMPLETED' && (
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleRefund(saleDetail.data);
                    }}
                  >
                    {t('sales.refund')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleCancel(saleDetail.data.id);
                    }}
                    disabled={cancelSale.isLoading}
                  >
                    {t('sales.cancel')}
                  </Button>
                </div>
              )}
            </div>
            {saleDetail.data.status === 'PARTIALLY_REFUNDED' && (
              <div className="border-t pt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleRefund(saleDetail.data);
                  }}
                >
                  {t('sales.refund')}
                </Button>
              </div>
            )}

            {/* Sale Items */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{t('sales.saleItems')}</h3>
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">{t('sales.product')}</th>
                      <th className="table-header-cell text-right">{t('sales.quantity')}</th>
                      <th className="table-header-cell text-right hidden sm:table-cell">{t('sales.refundModal.unitPrice')}</th>
                      <th className="table-header-cell text-right hidden md:table-cell">{t('sales.discount')}</th>
                      <th className="table-header-cell text-right">{t('sales.total')}</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {saleDetail.data.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900 truncate" title={item.product?.name || '-'}>
                            {item.product?.name || '-'}
                          </div>
                        </td>
                        <td className="table-cell text-right">
                          <div className="text-sm text-gray-600">{item.quantity}</div>
                        </td>
                        <td className="table-cell text-right hidden sm:table-cell">
                          <div className="text-sm text-gray-600">{formatCurrency(parseFloat(item.unitPrice), item.product?.currency || 'UZS')}</div>
                        </td>
                        <td className="table-cell text-right hidden md:table-cell">
                          <div className="text-sm text-gray-600">{formatCurrency(parseFloat(item.discount || 0), item.product?.currency || 'UZS')}</div>
                        </td>
                        <td className="table-cell text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(
                              parseFloat(item.unitPrice) * item.quantity - parseFloat(item.discount || 0),
                              item.product?.currency || 'UZS'
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                        {t('sales.total')}:
                      </td>
                      <td className="px-4 py-2 text-right text-base sm:text-lg font-bold text-blue-600">
                        {formatCurrency(parseFloat(saleDetail.data.total))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false);
          setSaleToRefund(null);
        }}
        title={`${t('sales.refundModal.title')} - ${saleToRefund?.saleNumber || ''}`}
        size="lg"
      >
        {saleToRefund && (
          <RefundModal
            sale={saleToRefund}
            onConfirm={handleConfirmRefund}
            onCancel={() => {
              setIsRefundModalOpen(false);
              setSaleToRefund(null);
            }}
            isLoading={refundSale.isLoading}
          />
        )}
      </Modal>

      {/* Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setInvoiceSaleId(null);
        }}
        title={t('sales.invoice')}
        size="xl"
      >
        {invoiceSaleId && (
          <InvoiceView saleId={invoiceSaleId} onClose={() => {
            setIsInvoiceModalOpen(false);
            setInvoiceSaleId(null);
          }} />
        )}
      </Modal>
    </div>
  );
};

export default SalesList;

