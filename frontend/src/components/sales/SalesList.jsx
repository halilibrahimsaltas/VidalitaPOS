import { useState } from 'react';
import { useSales, useSale, useRefundSale, useCancelSale } from '../../hooks/useSales';
import { HiDocumentText } from 'react-icons/hi2';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import BranchSelect from '../common/BranchSelect';
import RefundModal from './RefundModal';
import InvoiceView from './InvoiceView';

const SalesList = () => {
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
      alert(error.response?.data?.message || 'İade işlemi sırasında bir hata oluştu');
    }
  };

  const handleCancel = async (saleId) => {
    if (!window.confirm('Bu satışı iptal etmek istediğinizden emin misiniz? İptal edilen satışlar geri alınamaz.')) {
      return;
    }

    try {
      await cancelSale.mutateAsync(saleId);
      setIsDetailModalOpen(false);
      setSelectedSaleId(null);
    } catch (error) {
      alert(error.response?.data?.message || 'İptal işlemi sırasında bir hata oluştu');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
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
        Satışlar yüklenirken bir hata oluştu
      </div>
    );
  }

  const { sales, pagination } = data?.data || { sales: [], pagination: {} };

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'COMPLETED', label: 'Tamamlandı' },
    { value: 'REFUNDED', label: 'İade Edildi' },
    { value: 'PARTIALLY_REFUNDED', label: 'Kısmi İade' },
    { value: 'CANCELLED', label: 'İptal Edildi' },
  ];

  const paymentMethodLabels = {
    CASH: 'Nakit',
    CARD: 'Kart',
    CREDIT: 'Veresiye',
  };

  const statusLabels = {
    COMPLETED: 'Tamamlandı',
    REFUNDED: 'İade Edildi',
    PARTIALLY_REFUNDED: 'Kısmi İade',
    CANCELLED: 'İptal Edildi',
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <BranchSelect
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Tüm Şubeler"
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={statusOptions}
              placeholder="Tüm Durumlar"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              placeholder="Başlangıç"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              placeholder="Bitiş"
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
                <th className="table-header-cell min-w-[100px]">Fiş No</th>
                <th className="table-header-cell min-w-[120px]">Tarih</th>
                <th className="table-header-cell min-w-[120px] hidden md:table-cell">Şube</th>
                <th className="table-header-cell min-w-[120px] hidden lg:table-cell">Müşteri</th>
                <th className="table-header-cell min-w-[80px] hidden sm:table-cell">Ödeme</th>
                <th className="table-header-cell min-w-[100px] text-right">Toplam</th>
                <th className="table-header-cell min-w-[100px]">Durum</th>
                <th className="table-header-cell text-right min-w-[150px]">İşlemler</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Satış bulunamadı
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
                      <div className="text-sm text-gray-600 truncate" title={sale.customer?.name || 'Perakende'}>
                        {sale.customer?.name || 'Perakende'}
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <div className="text-sm text-gray-600 truncate">
                        {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(parseFloat(sale.total))}
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
                          title="Fatura"
                        >
                          <HiDocumentText className="w-4 h-4" />
                          Fatura
                        </button>
                        <button
                          onClick={() => handleViewDetails(sale.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                        >
                          Detay
                        </button>
                        {sale.status === 'COMPLETED' && (
                          <>
                            <button
                              onClick={() => handleRefund(sale)}
                              className="text-sm text-gray-600 hover:text-gray-700 font-medium whitespace-nowrap"
                            >
                              İade
                            </button>
                            <button
                              onClick={() => handleCancel(sale.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
                              disabled={cancelSale.isLoading}
                            >
                              İptal
                            </button>
                          </>
                        )}
                        {sale.status === 'PARTIALLY_REFUNDED' && (
                          <button
                            onClick={() => handleRefund(sale)}
                            className="text-sm text-gray-600 hover:text-gray-700 font-medium whitespace-nowrap"
                          >
                            İade
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
            Toplam {pagination.total} satış, Sayfa {pagination.page} / {pagination.totalPages}
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

      {/* Sale Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSaleId(null);
        }}
        title={`Satış Detayı - ${saleDetail?.data?.saleNumber || ''}`}
        size="lg"
      >
        {saleDetail?.data ? (
          <div className="space-y-4">
            {/* Sale Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fiş No</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                  {saleDetail.data.saleNumber}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tarih</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatDate(saleDetail.data.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Şube</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                  {saleDetail.data.branch?.name || '-'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kasiyer</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                  {saleDetail.data.cashier?.fullName || saleDetail.data.cashier?.username || '-'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Müşteri</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                  {saleDetail.data.customer?.name || 'Perakende'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ödeme Yöntemi</label>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                  {paymentMethodLabels[saleDetail.data.paymentMethod] || saleDetail.data.paymentMethod}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Durum</label>
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
                Faturayı Görüntüle
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
                    İade Et
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleCancel(saleDetail.data.id);
                    }}
                    disabled={cancelSale.isLoading}
                  >
                    İptal Et
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
                  İade Et
                </Button>
              </div>
            )}

            {/* Sale Items */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Satış Kalemleri</h3>
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Ürün</th>
                      <th className="table-header-cell text-right">Miktar</th>
                      <th className="table-header-cell text-right hidden sm:table-cell">Birim Fiyat</th>
                      <th className="table-header-cell text-right hidden md:table-cell">İndirim</th>
                      <th className="table-header-cell text-right">Toplam</th>
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
                          <div className="text-sm text-gray-600">{formatCurrency(parseFloat(item.unitPrice))}</div>
                        </td>
                        <td className="table-cell text-right hidden md:table-cell">
                          <div className="text-sm text-gray-600">{formatCurrency(parseFloat(item.discount || 0))}</div>
                        </td>
                        <td className="table-cell text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(
                              parseFloat(item.unitPrice) * item.quantity - parseFloat(item.discount || 0)
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                        Toplam:
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
          <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false);
          setSaleToRefund(null);
        }}
        title={`İade İşlemi - ${saleToRefund?.saleNumber || ''}`}
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
        title="Fatura"
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

