import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateCustomer, useUpdateCustomer, useRecordPayment } from '../hooks/useCustomers';
import PageLayout from '../components/layout/PageLayout';
import CustomerList from '../components/customers/CustomerList';
import CustomerForm from '../components/customers/CustomerForm';
import TransactionHistory from '../components/customers/TransactionHistory';
import PaymentForm from '../components/customers/PaymentForm';
import CustomerStatistics from '../components/customers/CustomerStatistics';
import Modal from '../components/common/Modal';

const Customers = () => {
  const { t } = useTranslation();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const recordPayment = useRecordPayment();

  const handleCreate = () => {
    setEditingCustomer(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsFormModalOpen(true);
  };

  const handleViewTransactions = (customer) => {
    setSelectedCustomer(customer);
    setIsTransactionModalOpen(true);
  };

  const handleRecordPayment = (customer) => {
    setSelectedCustomer(customer);
    setIsPaymentModalOpen(true);
  };

  const handleViewStatistics = (customer) => {
    setSelectedCustomer(customer);
    setIsStatisticsModalOpen(true);
  };

  const handleClose = () => {
    setIsFormModalOpen(false);
    setIsTransactionModalOpen(false);
    setIsPaymentModalOpen(false);
    setIsStatisticsModalOpen(false);
    setEditingCustomer(null);
    setSelectedCustomer(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({
          id: editingCustomer.id,
          data: formData,
        });
      } else {
        await createCustomer.mutateAsync(formData);
      }
      handleClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      await recordPayment.mutateAsync({
        customerId: selectedCustomer.id,
        data: paymentData,
      });
      handleClose();
      alert('Ödeme başarıyla kaydedildi');
    } catch (error) {
      alert(error.response?.data?.message || 'Ödeme kaydedilirken bir hata oluştu');
    }
  };

  const isLoading = createCustomer.isLoading || updateCustomer.isLoading || recordPayment.isLoading;

  return (
    <PageLayout
      title={t('customers.title')}
      description={t('customers.subtitle')}
    >
        <CustomerList
          onEdit={handleEdit}
          onCreate={handleCreate}
          onViewTransactions={handleViewTransactions}
          onRecordPayment={handleRecordPayment}
          onViewStatistics={handleViewStatistics}
        />

        {/* Customer Form Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={handleClose}
          title={editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Oluştur'}
          size="lg"
        >
          <CustomerForm
            customer={editingCustomer}
            onSubmit={handleFormSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
          />
        </Modal>

        {/* Transaction History Modal */}
        <Modal
          isOpen={isTransactionModalOpen}
          onClose={handleClose}
          title={`${selectedCustomer?.name} - Cari Hareketler`}
          size="xl"
        >
          {selectedCustomer && (
            <TransactionHistory customerId={selectedCustomer.id} onClose={handleClose} />
          )}
        </Modal>

        {/* Payment Modal */}
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={handleClose}
          title={t('customers.recordPayment')}
          size="md"
        >
          {selectedCustomer && (
            <PaymentForm
              customer={selectedCustomer}
              onSubmit={handlePaymentSubmit}
              onCancel={handleClose}
              isLoading={isLoading}
            />
          )}
        </Modal>

        {/* Statistics Modal */}
        <Modal
          isOpen={isStatisticsModalOpen}
          onClose={handleClose}
          title={`${selectedCustomer?.name} - İstatistikler`}
          size="xl"
        >
          {selectedCustomer && (
            <CustomerStatistics customerId={selectedCustomer.id} />
          )}
        </Modal>
    </PageLayout>
  );
};

export default Customers;

