import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const SplitPaymentModal = ({ isOpen, onClose, total, onSubmit, selectedCustomer }) => {
  const [payments, setPayments] = useState([
    { method: 'CASH', amount: '', cardType: '' },
  ]);

  useEffect(() => {
    if (isOpen) {
      setPayments([{ method: 'CASH', amount: '', cardType: '' }]);
    }
  }, [isOpen]);

  const addPayment = () => {
    setPayments([...payments, { method: 'CASH', amount: '', cardType: '' }]);
  };

  const removePayment = (index) => {
    if (payments.length > 1) {
      setPayments(payments.filter((_, i) => i !== index));
    }
  };

  const updatePayment = (index, field, value) => {
    const newPayments = [...payments];
    newPayments[index][field] = value;
    setPayments(newPayments);
  };

  const calculateTotal = () => {
    return payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  };

  const remaining = total - calculateTotal();
  const isValid = Math.abs(remaining) < 0.01; // Allow small rounding differences

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) {
      alert(`Toplam ödeme tutarı toplam tutara eşit olmalıdır. Kalan: ${remaining.toFixed(2)} ₺`);
      return;
    }

    // Check if any payment is CREDIT and validate customer
    const hasCredit = payments.some(p => p.method === 'CREDIT' && parseFloat(p.amount) > 0);
    if (hasCredit && !selectedCustomer) {
      alert('Veresiye ödemesi için müşteri seçilmesi zorunludur!');
      return;
    }

    // Group payments by method
    const paymentGroups = payments.reduce((acc, payment) => {
      const method = payment.method;
      const amount = parseFloat(payment.amount) || 0;
      if (amount > 0) {
        if (!acc[method]) {
          acc[method] = { method, amount: 0, cardTypes: [] };
        }
        acc[method].amount += amount;
        if (payment.cardType) {
          acc[method].cardTypes.push(payment.cardType);
        }
      }
      return acc;
    }, {});

    const paymentMethods = Object.keys(paymentGroups);
    const paymentMethod = paymentMethods.length === 1 
      ? paymentMethods[0] 
      : 'MIXED';

    const paidAmount = calculateTotal();

    onSubmit({
      paymentMethod,
      paidAmount,
      customerId: selectedCustomer?.id || null,
      splitPayments: Object.values(paymentGroups), // For reference/notes
    });
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      CASH: 'Nakit',
      CARD: 'Kart',
      CREDIT: 'Veresiye',
    };
    return labels[method] || method;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Parçalı Ödeme" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Info */}
        {selectedCustomer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-sm font-medium text-blue-900">Müşteri: {selectedCustomer.name}</div>
            {selectedCustomer.phone && (
              <div className="text-xs text-blue-700 mt-1">Tel: {selectedCustomer.phone}</div>
            )}
            {selectedCustomer.debt > 0 && (
              <div className="text-xs text-red-600 mt-1">Mevcut Borç: ₺{selectedCustomer.debt.toFixed(2)}</div>
            )}
          </div>
        )}

        {!selectedCustomer && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-600">Anonim Müşteri</div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Toplam Tutar:</span>
            <span className="font-bold text-2xl text-gray-900">₺{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Ödenen:</span>
            <span className={`font-semibold text-lg ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              ₺{calculateTotal().toFixed(2)}
            </span>
          </div>
          {remaining !== 0 && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Kalan:</span>
              <span className={`font-semibold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {remaining > 0 ? '+' : ''}₺{Math.abs(remaining).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Warning for credit payment without customer */}
        {payments.some(p => p.method === 'CREDIT' && parseFloat(p.amount) > 0) && !selectedCustomer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-yellow-800">
              ⚠️ Veresiye ödemesi için müşteri seçilmesi zorunludur. Lütfen POS ekranından müşteri seçin.
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Ödeme Yöntemleri</h3>
            <Button type="button" variant="secondary" onClick={addPayment} size="sm">
              + Ödeme Ekle
            </Button>
          </div>

          {payments.map((payment, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Ödeme {index + 1}</span>
                {payments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePayment(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Kaldır
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yöntem</label>
                  <select
                    value={payment.method}
                    onChange={(e) => updatePayment(index, 'method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="CASH">Nakit</option>
                    <option value="CARD">Kart</option>
                    <option value="CREDIT">Veresiye</option>
                  </select>
                </div>

                {payment.method === 'CARD' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kart Tipi</label>
                    <select
                      value={payment.cardType}
                      onChange={(e) => updatePayment(index, 'cardType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Seçiniz</option>
                      <option value="UZCARD">UzCard</option>
                      <option value="HUMO">Humo</option>
                      <option value="VISA">Visa</option>
                      <option value="MASTERCARD">Mastercard</option>
                      <option value="OTHER">Diğer</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={payment.amount}
                    onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {payments.some(p => p.method === 'CREDIT') && !selectedCustomer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              ⚠️ Veresiye ödemesi için müşteri seçilmesi zorunludur. Lütfen POS ekranından müşteri seçin.
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            İptal
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={!isValid || (payments.some(p => p.method === 'CREDIT' && parseFloat(p.amount) > 0) && !selectedCustomer)}
          >
            Ödemeyi Tamamla
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SplitPaymentModal;

