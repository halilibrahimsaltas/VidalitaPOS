import { useState } from 'react';
import { useSales, useSale } from '../../hooks/useSales';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import BranchSelect from '../common/BranchSelect';

const SalesList = () => {
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
    CANCELLED: 'İptal Edildi',
  };

  const statusColors = {
    COMPLETED: 'bg-green-100 text-green-800',
    REFUNDED: 'bg-orange-100 text-orange-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Şube
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ödeme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam
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
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Satış bulunamadı
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sale.saleNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(sale.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {sale.branch?.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {sale.customer?.name || 'Perakende'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(parseFloat(sale.total))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[sale.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[sale.status] || sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(sale.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Detay
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Fiş No</label>
                <p className="text-sm font-semibold text-gray-900">
                  {saleDetail.data.saleNumber}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tarih</label>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(saleDetail.data.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Şube</label>
                <p className="text-sm font-semibold text-gray-900">
                  {saleDetail.data.branch?.name || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kasiyer</label>
                <p className="text-sm font-semibold text-gray-900">
                  {saleDetail.data.cashier?.fullName || saleDetail.data.cashier?.username || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Müşteri</label>
                <p className="text-sm font-semibold text-gray-900">
                  {saleDetail.data.customer?.name || 'Perakende'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ödeme Yöntemi</label>
                <p className="text-sm font-semibold text-gray-900">
                  {paymentMethodLabels[saleDetail.data.paymentMethod] || saleDetail.data.paymentMethod}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Durum</label>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    statusColors[saleDetail.data.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusLabels[saleDetail.data.status] || saleDetail.data.status}
                </span>
              </div>
            </div>

            {/* Sale Items */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Satış Kalemleri</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Ürün
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Miktar
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Birim Fiyat
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        İndirim
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Toplam
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {saleDetail.data.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.product?.name || '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500 text-right">
                          {formatCurrency(parseFloat(item.unitPrice))}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500 text-right">
                          {formatCurrency(parseFloat(item.discount || 0))}
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">
                          {formatCurrency(
                            parseFloat(item.unitPrice) * item.quantity - parseFloat(item.discount || 0)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                        Toplam:
                      </td>
                      <td className="px-4 py-2 text-right text-lg font-bold text-primary-600">
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
    </div>
  );
};

export default SalesList;

