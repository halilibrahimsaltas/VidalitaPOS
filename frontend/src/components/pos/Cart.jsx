import Button from '../common/Button';

const Cart = ({ items, onRemoveItem, onUpdateQuantity, onClear }) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Sepet ({items.length})</h3>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Temizle
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Sepet boş
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.product.name}</div>
                    {item.product.barcode && (
                      <div className="text-xs text-gray-500 font-mono">
                        {item.product.barcode}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                      className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₺{item.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      ₺{item.unitPrice.toFixed(2)} x {item.quantity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Ara Toplam:</span>
            <span className="font-semibold">₺{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Toplam:</span>
            <span>₺{subtotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

