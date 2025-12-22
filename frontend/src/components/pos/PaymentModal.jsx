import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';

const PaymentModal = ({ isOpen, onClose, total, onSubmit, onSplitPayment, selectedCustomer, currency = 'UZS' }) => {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paidAmount, setPaidAmount] = useState('');
  const [discountType, setDiscountType] = useState('amount'); // 'amount' or 'percentage'
  const [discountValue, setDiscountValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('CASH');
      setDiscountType('amount');
      setDiscountValue('');
    }
  }, [isOpen]);

  // Calculate discount amount
  const discountAmount = discountValue
    ? discountType === 'percentage'
      ? (total * parseFloat(discountValue)) / 100
      : parseFloat(discountValue)
    : 0;

  const finalTotal = Math.max(0, total - discountAmount);

  // Update paidAmount when total or discount changes - auto set to finalTotal
  useEffect(() => {
    if (isOpen) {
      if (paymentMethod === 'CREDIT') {
        setPaidAmount('0');
      } else {
        setPaidAmount(finalTotal.toFixed(2));
      }
    }
  }, [isOpen, finalTotal, paymentMethod]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate: Veresiye ödemesi için müşteri zorunlu
    if (paymentMethod === 'CREDIT' && !selectedCustomer) {
      alert(t('pos.paymentModal.creditRequired'));
      return;
    }

    onSubmit({
      paymentMethod,
      paidAmount: paymentMethod === 'CREDIT' ? 0 : finalTotal,
      customerId: selectedCustomer?.id || null,
      discount: discountAmount,
    });
  };

  const changeAmount = Math.max(0, (parseFloat(paidAmount) || finalTotal) - finalTotal);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pos.payment')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pos.paymentMethod')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('CASH');
                setPaidAmount(finalTotal.toFixed(2));
              }}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                paymentMethod === 'CASH'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {t('pos.cash')}
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('CARD');
                setPaidAmount(finalTotal.toFixed(2));
              }}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                paymentMethod === 'CARD'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {t('pos.card')}
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
              {t('pos.credit')}
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('MIXED');
                setPaidAmount(finalTotal.toFixed(2));
              }}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                paymentMethod === 'MIXED'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {t('pos.mixed')}
            </button>
          </div>
        </div>

        {/* Customer Info */}
        {selectedCustomer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-900">{t('pos.paymentModal.customer')}: {selectedCustomer.name}</div>
                {selectedCustomer.phone && (
                  <div className="text-xs text-blue-700 mt-1">{t('pos.paymentModal.phone')}: {selectedCustomer.phone}</div>
                )}
                {selectedCustomer.debt > 0 && (
                  <div className="text-xs text-red-600 mt-1">{t('pos.paymentModal.currentDebt')}: {formatCurrency(selectedCustomer.debt, 'UZS')}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedCustomer && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-sm text-gray-600">{t('pos.paymentModal.anonymousCustomer')}</div>
          </div>
        )}

        {/* Discount Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pos.paymentModal.discount')}
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
              {t('pos.paymentModal.amount')}
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
              {t('pos.paymentModal.percentage')}
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
              {t('pos.paymentModal.discountAmount')}: -{formatCurrency(discountAmount, currency)}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">{t('pos.subtotal')}:</span>
            <span className="font-semibold">{formatCurrency(total, currency)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between mb-2 text-red-600">
              <span className="text-gray-600">{t('pos.paymentModal.discount')}:</span>
              <span className="font-semibold">-{formatCurrency(discountAmount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-300 pt-2">
            <span className="text-gray-600 font-semibold">{t('pos.total')}:</span>
            <span className="font-bold text-lg">{formatCurrency(finalTotal, currency)}</span>
          </div>
        </div>

        {paymentMethod !== 'CREDIT' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">{t('pos.paymentModal.paidAmountLabel')}:</span>
              <span className="text-lg font-bold text-blue-900">{formatCurrency(finalTotal, currency)}</span>
            </div>
            <p className="mt-1 text-xs text-blue-700">{t('pos.paymentModal.paidAmountNote')}</p>
          </div>
        )}

        {paymentMethod === 'CREDIT' && !selectedCustomer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              ⚠️ {t('pos.paymentModal.creditWarning')}
            </div>
          </div>
        )}

        {paymentMethod !== 'CREDIT' && changeAmount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex justify-between">
              <span className="text-green-800 font-medium">{t('pos.change')}:</span>
              <span className="text-green-800 font-bold">{formatCurrency(changeAmount, currency)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          {onSplitPayment && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                if (onSplitPayment) {
                  onSplitPayment();
                }
              }}
            >
              {t('pos.paymentModal.splitPayment')}
            </Button>
          )}
          <Button 
            type="submit" 
            variant="primary"
            disabled={paymentMethod === 'CREDIT' && !selectedCustomer}
          >
            {t('pos.paymentModal.completeButton')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;

