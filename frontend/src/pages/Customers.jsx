import { useState } from 'react';
import { useCreateCustomer, useUpdateCustomer, useRecordPayment } from '../hooks/useCustomers';
import CustomerList from '../components/customers/CustomerList';
import CustomerForm from '../components/customers/CustomerForm';
import TransactionHistory from '../components/customers/TransactionHistory';
import PaymentForm from '../components/customers/PaymentForm';
import Modal from '../components/common/Modal';

const Customers = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
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

  const handleClose = () => {
    setIsFormModalOpen(false);
    setIsTransactionModalOpen(false);
    setIsPaymentModalOpen(false);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Müşteri Yönetimi</h1>
          <p className="mt-2 text-sm text-gray-600">
            Müşterileri görüntüleyin, oluşturun ve cari hesaplarını yönetin
          </p>
        </div>

        <CustomerList
          onEdit={handleEdit}
          onCreate={handleCreate}
          onViewTransactions={handleViewTransactions}
          onRecordPayment={handleRecordPayment}
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
          title="Ödeme Kaydet"
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
      </div>
    </div>
  );
};

export default Customers;

