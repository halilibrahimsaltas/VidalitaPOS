import { useState, useRef, useEffect } from 'react';
import { useProductByBarcode, useProducts } from '../../hooks/useProducts';
import { useBranches } from '../../hooks/useBranches';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Cart from './Cart';

const POSScreen = ({ onCheckout, onSplitPayment }) => {
  const { user } = useAuth();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const barcodeInputRef = useRef(null);

  const { data: branchesData } = useBranches({ limit: 100 });
  const branches = branchesData?.data?.branches || [];

  const { data: productData, refetch: fetchProduct } = useProductByBarcode(barcodeInput);
  const { data: productsData } = useProducts({ 
    limit: 50, 
    search: productSearch,
    isActive: true,
  });
  const products = productsData?.data?.products || [];

  // Auto-focus barcode input
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Set default branch if user has one
  useEffect(() => {
    if (user?.branchId && !selectedBranch) {
      setSelectedBranch(user.branchId);
    }
  }, [user, selectedBranch]);

  // Handle product found
  useEffect(() => {
    if (productData?.data && barcodeInput) {
      const product = productData.data;
      addToCart(product);
      setBarcodeInput('');
    }
  }, [productData, barcodeInput]);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      fetchProduct();
    }
  };

  const addToCart = (product) => {
    const existingItemIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingItemIndex >= 0) {
      // Update quantity
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      newCart[existingItemIndex].total = newCart[existingItemIndex].quantity * newCart[existingItemIndex].unitPrice;
      setCart(newCart);
    } else {
      // Add new item
      const unitPrice = parseFloat(product.price);
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          unitPrice,
          discount: 0,
          total: unitPrice,
        },
      ]);
    }
  };

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    newCart[index].total = newQuantity * newCart[index].unitPrice - newCart[index].discount;
    setCart(newCart);
  };

  const clearCart = () => {
    if (window.confirm('Sepeti temizlemek istediğinize emin misiniz?')) {
      setCart([]);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Sepet boş!');
      return;
    }

    if (!selectedBranch) {
      alert('Lütfen bir şube seçin!');
      return;
    }

    const items = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
    }));

    onCheckout({
      branchId: selectedBranch,
      items,
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Left Panel - Product Search */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Ürün Arama</h3>
          
          {/* Branch Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şube
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Şube seçin...</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
          </div>

          {/* Barcode Input */}
          <form onSubmit={handleBarcodeSubmit}>
            <Input
              ref={barcodeInputRef}
              label="Barkod / Ürün Kodu"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Barkod okuyun veya girin..."
              autoFocus
            />
            <Button type="submit" variant="primary" className="w-full mt-2">
              Ara
            </Button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // This will be handled by ProductSelectionModal
                setShowProductModal(true);
              }}
            >
              Ürün Listesi
            </Button>
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              Sepeti Temizle
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="lg:col-span-1">
        <Cart
          items={cart}
          onRemoveItem={removeItem}
          onUpdateQuantity={updateQuantity}
          onClear={clearCart}
        />
        {cart.length > 0 && (
          <div className="mt-4 space-y-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleCheckout}
            >
              Ödemeye Geç ({subtotal.toFixed(2)} ₺)
            </Button>
            {onSplitPayment && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const items = cart.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount,
                  }));
                  onSplitPayment({
                    branchId: selectedBranch,
                    items,
                  });
                }}
              >
                Parçalı Ödeme
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Product Selection Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setProductSearch('');
        }}
        title="Ürün Seç"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Ürün Ara"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Ürün adı, barkod veya SKU ile ara..."
            autoFocus
          />

          <div className="max-h-96 overflow-y-auto">
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Ürün bulunamadı
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      addToCart(product);
                      setShowProductModal(false);
                      setProductSearch('');
                    }}
                    className="text-left p-3 border rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.barcode && `Barkod: ${product.barcode} | `}
                      {product.sku && `SKU: ${product.sku} | `}
                      Fiyat: ₺{parseFloat(product.price).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default POSScreen;

