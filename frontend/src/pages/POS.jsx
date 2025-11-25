import { useState } from 'react';
import { useCreateSale } from '../hooks/useSales';
import POSScreen from '../components/pos/POSScreen';
import PaymentModal from '../components/pos/PaymentModal';
import Modal from '../components/common/Modal';
import Button from '../common/Button';

const POS = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [completedSale, setCompletedSale] = useState(null);

  const createSale = useCreateSale();

  const handleCheckout = (data) => {
    setCheckoutData(data);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const saleData = {
        ...checkoutData,
        ...paymentData,
        discount: 0,
      };

      const result = await createSale.mutateAsync(saleData);
      setCompletedSale(result.data);
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
      setCheckoutData(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Satış işlemi başarısız!');
    }
  };

  const handleCloseReceipt = () => {
    setIsReceiptModalOpen(false);
    setCompletedSale(null);
    window.location.reload(); // Refresh to clear cart
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">POS Ekranı</h1>
          <p className="mt-2 text-sm text-gray-600">
            Barkod okuyun veya ürün kodunu girin
          </p>
        </div>

        <POSScreen onCheckout={handleCheckout} />

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          total={checkoutData?.items?.reduce((sum, item) => {
            const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
            return sum + itemTotal;
          }, 0) || 0}
          onSubmit={handlePaymentSubmit}
        />

        {completedSale && (
          <Modal
            isOpen={isReceiptModalOpen}
            onClose={handleCloseReceipt}
            title="Satış Tamamlandı"
            size="lg"
          >
            <div className="p-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  ✅ Satış başarıyla tamamlandı!
                </h3>
                <p className="text-sm text-green-700">
                  Fiş No: {completedSale.saleNumber}
                </p>
                <p className="text-sm text-green-700">
                  Toplam: ₺{parseFloat(completedSale.total).toFixed(2)}
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCloseReceipt} variant="primary">
                  Yeni Satış
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default POS;

