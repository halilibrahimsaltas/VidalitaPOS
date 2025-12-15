import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const PaymentModal = ({ isOpen, onClose, total, onSubmit }) => {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paidAmount, setPaidAmount] = useState('');
  const [customerId, setCustomerId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('CASH');
      setPaidAmount(total.toFixed(2));
      setCustomerId('');
    }
  }, [isOpen, total]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      paymentMethod,
      paidAmount: parseFloat(paidAmount) || total,
      customerId: customerId && customerId.trim() !== '' ? customerId : null,
    });
  };

  const changeAmount = Math.max(0, (parseFloat(paidAmount) || total) - total);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ödeme" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ödeme Yöntemi
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('CASH');
                setPaidAmount(total.toFixed(2));
              }}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                paymentMethod === 'CASH'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Nakit
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('CARD');
                setPaidAmount(total.toFixed(2));
              }}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                paymentMethod === 'CARD'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Kart
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('CREDIT');
                setPaidAmount('0');
              }}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                paymentMethod === 'CREDIT'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Veresiye
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('MIXED');
                setPaidAmount(total.toFixed(2));
              }}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                paymentMethod === 'MIXED'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Karma
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Toplam:</span>
            <span className="font-semibold text-lg">₺{total.toFixed(2)}</span>
          </div>
        </div>

        {paymentMethod !== 'CREDIT' && (
          <Input
            label="Ödenen Tutar"
            type="number"
            step="0.01"
            min="0"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            required
            placeholder="0.00"
          />
        )}

        {paymentMethod === 'CREDIT' && (
          <Input
            label="Müşteri ID (Opsiyonel)"
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Müşteri ID"
          />
        )}

        {paymentMethod !== 'CREDIT' && changeAmount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex justify-between">
              <span className="text-green-800 font-medium">Para Üstü:</span>
              <span className="text-green-800 font-bold">₺{changeAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" variant="primary">
            Ödemeyi Tamamla
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;

