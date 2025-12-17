import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';

const RefundModal = ({ sale, onConfirm, onCancel, isLoading }) => {
  const { t } = useTranslation();
  const [refundItems, setRefundItems] = useState(
    sale?.items?.map((item) => ({
      itemId: item.id,
      quantity: item.quantity,
      maxQuantity: item.quantity,
    })) || []
  );

  const handleQuantityChange = (itemId, newQuantity) => {
    setRefundItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          const quantity = Math.max(0, Math.min(newQuantity, item.maxQuantity));
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const handleSelectAll = () => {
    setRefundItems((prev) =>
      prev.map((item) => ({ ...item, quantity: item.maxQuantity }))
    );
  };

  const handleDeselectAll = () => {
    setRefundItems((prev) =>
      prev.map((item) => ({ ...item, quantity: 0 }))
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const calculateRefundTotal = () => {
    return refundItems.reduce((total, refundItem) => {
      const saleItem = sale.items.find((item) => item.id === refundItem.itemId);
      if (!saleItem) return total;
      const itemTotal =
        parseFloat(saleItem.unitPrice) * refundItem.quantity -
        (parseFloat(saleItem.discount || 0) * refundItem.quantity) /
          saleItem.quantity;
      return total + itemTotal;
    }, 0);
  };

  const hasSelectedItems = refundItems.some((item) => item.quantity > 0);
  const selectedItems = refundItems.filter((item) => item.quantity > 0);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>İade İşlemi:</strong> İade edilecek ürünleri ve miktarlarını seçin.
          Kısmi iade yapabilirsiniz. İade edilen ürünler stoka geri eklenecektir.
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">İade Edilecek Ürünler</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={isLoading}
          >
            Tümünü Seç
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={isLoading}
          >
            Tümünü Kaldır
          </Button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('sales.refundModal.product')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('sales.refundModal.sold')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('sales.refundModal.refundQuantity')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('sales.refundModal.unitPrice')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('sales.refundModal.refundAmount')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sale?.items?.map((item) => {
              const refundItem = refundItems.find((ri) => ri.itemId === item.id);
              const refundQuantity = refundItem?.quantity || 0;
              const itemRefundTotal =
                (parseFloat(item.unitPrice) * refundQuantity -
                  (parseFloat(item.discount || 0) * refundQuantity) / item.quantity);

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.product?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            Math.max(0, refundQuantity - 1)
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={refundQuantity === 0 || isLoading}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={refundQuantity}
                        onChange={(e) =>
                          handleQuantityChange(item.id, parseInt(e.target.value) || 0)
                        }
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            Math.min(item.quantity, refundQuantity + 1)
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={refundQuantity >= item.quantity || isLoading}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">
                    {formatCurrency(parseFloat(item.unitPrice))}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(itemRefundTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              {t('sales.refundModal.selectedItems')}: {selectedItems.length} / {sale?.items?.length || 0}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{t('sales.refundModal.totalRefundAmount')}:</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(calculateRefundTotal())}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => onConfirm(selectedItems)}
          disabled={!hasSelectedItems || isLoading}
        >
          {isLoading ? t('sales.refundModal.processing') : t('sales.refundModal.refundButton')}
        </Button>
      </div>
    </div>
  );
};

export default RefundModal;

