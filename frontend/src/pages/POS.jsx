import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useCreateSale } from '../hooks/useSales';
import POSScreen from '../components/pos/POSScreen';
import PaymentModal from '../components/pos/PaymentModal';
import SplitPaymentModal from '../components/pos/SplitPaymentModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

const POS = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSplitPaymentModalOpen, setIsSplitPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [completedSale, setCompletedSale] = useState(null);

  const createSale = useCreateSale();

  const handleLogout = () => {
    logout();
  };

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 md:space-x-8 flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                🛍️ Vidalita Retail Manager
              </h1>
              <nav className="hidden md:flex space-x-2 items-center">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.dashboard')}
                </Link>
                <Link
                  to="/branches"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.branches')}
                </Link>
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.products')}
                </Link>
                <Link
                  to="/inventory"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.inventory')}
                </Link>
                <Link
                  to="/pos"
                  className="text-primary-600 font-medium px-2 py-2 rounded-md text-sm whitespace-nowrap"
                >
                  {t('navigation.pos')}
                </Link>
                <Link
                  to="/sales"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  Satış Geçmişi
                </Link>
                <Link
                  to="/customers"
                  className="text-gray-700 hover:text-primary-600 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {t('navigation.customers')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              <LanguageSwitcher />
              <span className="text-sm text-gray-700 whitespace-nowrap hidden lg:inline">
                {t('auth.welcome')}, <strong>{user?.fullName || user?.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm whitespace-nowrap"
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">POS Ekranı</h1>
          <p className="mt-2 text-sm text-gray-600">
            Barkod okuyun veya ürün kodunu girin
          </p>
        </div>

        <POSScreen 
          onCheckout={handleCheckout} 
          onSplitPayment={() => {
            setCheckoutData({
              branchId: checkoutData?.branchId,
              items: checkoutData?.items,
            });
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
      </main>
    </div>
  );
};

export default POS;

