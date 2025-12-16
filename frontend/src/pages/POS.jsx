import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateSale } from '../hooks/useSales';
import PageLayout from '../components/layout/PageLayout';
import POSScreen from '../components/pos/POSScreen';
import PaymentModal from '../components/pos/PaymentModal';
import SplitPaymentModal from '../components/pos/SplitPaymentModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

const POS = () => {
  const { t } = useTranslation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSplitPaymentModalOpen, setIsSplitPaymentModalOpen] = useState(false);
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
        customerId: paymentData.customerId || null,
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

  const handleSplitPaymentSubmit = async (paymentData) => {
    try {
      const saleData = {
        ...checkoutData,
        ...paymentData,
        discount: 0,
        customerId: paymentData.customerId || null,
        notes: paymentData.splitPayments 
          ? `Parçalı ödeme: ${paymentData.splitPayments.map(p => `${p.method} ${p.amount.toFixed(2)}₺`).join(', ')}`
          : null,
      };

      const result = await createSale.mutateAsync(saleData);
      setCompletedSale(result.data);
      setIsSplitPaymentModalOpen(false);
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
    <PageLayout
      title={t('pos.title')}
      description={t('pos.subtitle')}
    >
        <POSScreen 
          onCheckout={handleCheckout} 
          onSplitPayment={(data) => {
            setCheckoutData(data);
            setIsPaymentModalOpen(false);
            setIsSplitPaymentModalOpen(true);
          }}
        />

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setCheckoutData(null);
          }}
          total={checkoutData?.items?.reduce((sum, item) => {
            const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
            return sum + itemTotal;
          }, 0) || 0}
          onSubmit={handlePaymentSubmit}
          onSplitPayment={() => {
            setIsPaymentModalOpen(false);
            setIsSplitPaymentModalOpen(true);
          }}
        />

        <SplitPaymentModal
          isOpen={isSplitPaymentModalOpen}
          onClose={() => {
            setIsSplitPaymentModalOpen(false);
            setCheckoutData(null);
          }}
          total={checkoutData?.items?.reduce((sum, item) => {
            const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
            return sum + itemTotal;
          }, 0) || 0}
          onSubmit={handleSplitPaymentSubmit}
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
    </PageLayout>
  );
};

export default POS;

