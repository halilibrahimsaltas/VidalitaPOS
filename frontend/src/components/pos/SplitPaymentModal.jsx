import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';

const SplitPaymentModal = ({ isOpen, onClose, total, onSubmit, selectedCustomer, currency = 'UZS' }) => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([
    { method: 'CASH', amount: '', cardType: '' },
  ]);
  const [discountType, setDiscountType] = useState('amount');
  const [discountValue, setDiscountValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPayments([{ method: 'CASH', amount: '', cardType: '' }]);
      setDiscountType('amount');
      setDiscountValue('');
    }
  }, [isOpen, total]);

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

  // Calculate discount amount
  const discountAmount = discountValue
    ? discountType === 'percentage'
      ? (total * parseFloat(discountValue)) / 100
      : parseFloat(discountValue)
    : 0;

  const finalTotal = Math.max(0, total - discountAmount);

  const calculateTotal = () => {
    return payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  };

  const remaining = finalTotal - calculateTotal();
  const isValid = Math.abs(remaining) < 0.01; // Allow small rounding differences

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) {
      alert(`${t('pos.splitPaymentModal.totalMismatch')}. ${t('pos.splitPaymentModal.remaining')}: ${formatCurrency(remaining, currency)}`);
      return;
    }

    // Check if any payment is CREDIT and validate customer
    const hasCredit = payments.some(p => p.method === 'CREDIT' && parseFloat(p.amount) > 0);
    if (hasCredit && !selectedCustomer) {
      alert(t('pos.paymentModal.creditRequired'));
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
              discount: discountAmount,
              splitPayments: Object.values(paymentGroups), // For reference/notes
            });
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      CASH: t('pos.cash'),
      CARD: t('pos.card'),
      CREDIT: t('pos.credit'),
    };
    return labels[method] || method;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pos.splitPaymentModal.title')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Info */}
        {selectedCustomer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-sm font-medium text-blue-900">{t('pos.splitPaymentModal.customer')}: {selectedCustomer.name}</div>
            {selectedCustomer.phone && (
              <div className="text-xs text-blue-700 mt-1">{t('pos.splitPaymentModal.phone')}: {selectedCustomer.phone}</div>
            )}
            {selectedCustomer.debt > 0 && (
              <div className="text-xs text-red-600 mt-1">{t('pos.splitPaymentModal.currentDebt')}: {formatCurrency(selectedCustomer.debt, 'UZS')}</div>
            )}
          </div>
        )}

        {!selectedCustomer && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-600">{t('pos.splitPaymentModal.anonymousCustomer')}</div>
          </div>
        )}

                {/* Discount Section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pos.splitPaymentModal.discount')}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('amount');
                        setDiscountValue('');
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors ${
                        discountType === 'amount'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {t('pos.splitPaymentModal.amount')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('percentage');
                        setDiscountValue('');
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors ${
                        discountType === 'percentage'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {t('pos.splitPaymentModal.percentage')}
                    </button>
                  </div>
                  <Input
                    type="number"
                    step={discountType === 'percentage' ? '0.01' : '0.01'}
                    min="0"
                    max={discountType === 'percentage' ? '100' : total}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? '0.00' : '0.00'}
                  />
                  {discountAmount > 0 && (
                    <div className="mt-2 text-sm text-green-700 font-medium">
                      {t('pos.splitPaymentModal.discountAmount')}: -{formatCurrency(discountAmount, currency)}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">{t('pos.subtotal')}:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(total, currency)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center mb-2 text-red-600">
                      <span className="text-gray-600">{t('pos.splitPaymentModal.discount')}:</span>
                      <span className="font-semibold">-{formatCurrency(discountAmount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-gray-300 pt-2">
                    <span className="text-gray-600 font-medium">{t('pos.splitPaymentModal.totalAmount')}:</span>
                    <span className="font-bold text-2xl text-gray-900">{formatCurrency(finalTotal, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">{t('pos.splitPaymentModal.paid')}:</span>
                    <span className={`font-semibold text-lg ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(calculateTotal(), currency)}
                    </span>
                  </div>
                  {remaining !== 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">{t('pos.splitPaymentModal.remaining')}:</span>
                      <span className={`font-semibold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {remaining > 0 ? '+' : ''}{formatCurrency(Math.abs(remaining), currency)}
                      </span>
                    </div>
                  )}
                </div>

        {/* Warning for credit payment without customer */}
        {payments.some(p => p.method === 'CREDIT' && parseFloat(p.amount) > 0) && !selectedCustomer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-yellow-800">
              ⚠️ {t('pos.splitPaymentModal.creditWarning')}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">{t('pos.splitPaymentModal.paymentMethods')}</h3>
            <Button type="button" variant="secondary" onClick={addPayment} size="sm">
              {t('pos.splitPaymentModal.addPayment')}
            </Button>
          </div>

          {payments.map((payment, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">{t('pos.splitPaymentModal.payment')} {index + 1}</span>
                {payments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePayment(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    {t('pos.splitPaymentModal.remove')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pos.splitPaymentModal.method')}</label>
                  <select
                    value={payment.method}
                    onChange={(e) => updatePayment(index, 'method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="CASH">{t('pos.cash')}</option>
                    <option value="CARD">{t('pos.card')}</option>
                    <option value="CREDIT">{t('pos.credit')}</option>
                  </select>
                </div>

                {payment.method === 'CARD' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('pos.splitPaymentModal.cardType')}</label>
                    <select
                      value={payment.cardType}
                      onChange={(e) => updatePayment(index, 'cardType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">{t('pos.splitPaymentModal.cardTypeSelect')}</option>
                      <option value="UZCARD">{t('pos.splitPaymentModal.uzcard')}</option>
                      <option value="HUMO">{t('pos.splitPaymentModal.humo')}</option>
                      <option value="VISA">{t('pos.splitPaymentModal.visa')}</option>
                      <option value="MASTERCARD">{t('pos.splitPaymentModal.mastercard')}</option>
                      <option value="OTHER">{t('pos.splitPaymentModal.other')}</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pos.splitPaymentModal.amountLabel')}</label>
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
              ⚠️ {t('pos.splitPaymentModal.creditWarning')}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={!isValid || (payments.some(p => p.method === 'CREDIT' && parseFloat(p.amount) > 0) && !selectedCustomer)}
          >
            {t('pos.splitPaymentModal.completeButton')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SplitPaymentModal;

