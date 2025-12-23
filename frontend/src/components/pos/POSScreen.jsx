import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductByBarcode, useProducts } from '../../hooks/useProducts';
import { useBranches } from '../../hooks/useBranches';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/product.service';
import CustomerSelector from './CustomerSelector';
import { HiShoppingCart, HiPlus, HiMinus, HiTrash } from 'react-icons/hi2';
import { HiX } from 'react-icons/hi';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';

const POSScreen = ({ onCheckout, onSplitPayment }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage on mount
    try {
      const savedCart = localStorage.getItem('pos_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Recalculate totals for saved items
        return parsed.map(item => ({
          ...item,
          total: item.quantity * item.unitPrice - (item.discount || 0),
        }));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    return [];
  });
  const [selectedBranch, setSelectedBranch] = useState(() => {
    // Load selected branch from localStorage
    const saved = localStorage.getItem('pos_selectedBranch');
    return saved || '';
  });
  const [selectedCustomer, setSelectedCustomer] = useState(() => {
    // Load selected customer from localStorage
    try {
      const saved = localStorage.getItem('pos_selectedCustomer');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading customer from localStorage:', error);
    }
    return null;
  });
  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const barcodeInputRef = useRef(null);

  const { data: branchesData } = useBranches({ limit: 100, isActive: true });
  const branches = branchesData?.data?.branches || [];

  const { data: productData, refetch: fetchProduct } = useProductByBarcode(barcodeInput);
  const { data: productsData } = useProducts({ 
    page: productPage,
    limit: 20, 
    search: productSearch || undefined,
    isActive: true,
  });
  const products = productsData?.data?.products || [];
  const totalProducts = productsData?.data?.pagination?.total || 0;

  // Auto-focus barcode input
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Set default branch
  useEffect(() => {
    if (!selectedBranch && branches.length > 0) {
      if (user?.branchId) {
        // Use user's branch if available
        const branchId = user.branchId;
        setSelectedBranch(branchId);
        localStorage.setItem('pos_selectedBranch', branchId);
      } else if (user?.role === 'ADMIN' && branches[0]) {
        // Admin: use first branch
        const branchId = branches[0].id;
        setSelectedBranch(branchId);
        localStorage.setItem('pos_selectedBranch', branchId);
      }
    }
  }, [user, branches, selectedBranch]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      // Save only essential data (product id, not full product object)
      const cartToSave = cart.map(item => ({
        productId: item.product.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          barcode: item.product.barcode,
          imageUrl: item.product.imageUrl,
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: item.total,
      }));
      localStorage.setItem('pos_cart', JSON.stringify(cartToSave));
    } else {
      localStorage.removeItem('pos_cart');
    }
  }, [cart]);

  // Save selected branch to localStorage
  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem('pos_selectedBranch', selectedBranch);
    }
  }, [selectedBranch]);

  // Save selected customer to localStorage
  useEffect(() => {
    if (selectedCustomer) {
      localStorage.setItem('pos_selectedCustomer', JSON.stringify(selectedCustomer));
    } else {
      localStorage.removeItem('pos_selectedCustomer');
    }
  }, [selectedCustomer]);

  // Save selected customer to localStorage
  useEffect(() => {
    if (selectedCustomer) {
      localStorage.setItem('pos_selectedCustomer', JSON.stringify(selectedCustomer));
    } else {
      localStorage.removeItem('pos_selectedCustomer');
    }
  }, [selectedCustomer]);

  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.product.id === product.id);

      if (existingItemIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        newCart[existingItemIndex].total = newCart[existingItemIndex].quantity * newCart[existingItemIndex].unitPrice - (newCart[existingItemIndex].discount || 0);
        return newCart;
      } else {
        const unitPrice = parseFloat(product.price);
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            unitPrice,
            discount: 0,
            total: unitPrice,
          },
        ];
      }
    });
  }, []);

  // Handle product found by barcode
  useEffect(() => {
    if (productData?.data && barcodeInput) {
      const product = productData.data;
      addToCart(product);
      setBarcodeInput('');
      setProductSearch(''); // Clear search when barcode is found
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }
  }, [productData, barcodeInput, addToCart]);

  // Sync barcode input with product search
  useEffect(() => {
    if (barcodeInput && !barcodeInput.match(/^\d+$/)) {
      // If input is not just numbers, treat it as search
      setProductSearch(barcodeInput);
    } else if (!barcodeInput) {
      setProductSearch('');
    }
  }, [barcodeInput]);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      fetchProduct();
    }
  };


  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    newCart[index].total = newQuantity * newCart[index].unitPrice - (newCart[index].discount || 0);
    setCart(newCart);
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm(t('pos.clear') + '?')) {
      setCart([]);
      localStorage.removeItem('pos_cart');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Sepet boş!');
      return;
    }

    if (!selectedBranch) {
      alert(t('pos.selectBranchAlert'));
      return;
    }

    const items = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
    }));

    onCheckout({
      branchId: selectedBranch,
      items,
      customerId: selectedCustomer?.id || null,
      customer: selectedCustomer || null,
      currency: cartCurrency,
    });
  };

  const handleSplitPayment = () => {
    if (cart.length === 0) {
      alert('Sepet boş!');
      return;
    }

    if (!selectedBranch) {
      alert(t('pos.selectBranchAlert'));
      return;
    }

    const items = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
    }));

    onSplitPayment({
      branchId: selectedBranch,
      items,
      customerId: selectedCustomer?.id || null,
      customer: selectedCustomer || null,
      currency: cartCurrency,
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
  const total = subtotal;

  // Get the most common currency from cart items, or default to UZS
  const getCartCurrency = () => {
    if (cart.length === 0) return 'UZS';
    const currencies = cart.map(item => item.product?.currency || 'UZS');
    const currencyCounts = {};
    currencies.forEach(curr => {
      currencyCounts[curr] = (currencyCounts[curr] || 0) + 1;
    });
    return Object.keys(currencyCounts).reduce((a, b) => 
      currencyCounts[a] > currencyCounts[b] ? a : b
    );
  };
  const cartCurrency = getCartCurrency();

  const selectedBranchName = branches.find(b => b.id === selectedBranch)?.name || '';

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gray-50">
      {/* Top Bar - Barcode Input & Branch Selection */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Branch Selection */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('pos.branch')}</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={user?.role !== 'ADMIN' && user?.branchId}
            >
              <option value="">{t('pos.selectBranch')}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Selection */}
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
            onClearCustomer={() => setSelectedCustomer(null)}
          />

          {/* Barcode Input */}
          <form onSubmit={handleBarcodeSubmit} className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder={t('pos.barcodePlaceholder')}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                autoFocus
              />
              {barcodeInput && (
                <button
                  type="button"
                  onClick={() => {
                    setBarcodeInput('');
                    setProductSearch('');
                    if (barcodeInputRef.current) {
                      barcodeInputRef.current.focus();
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <HiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {/* Cart Summary */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HiShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{cart.length} {t('pos.product')}</span>
            <span className="text-gray-400">|</span>
            <span className="font-bold text-lg text-gray-900">{formatCurrency(total, cartCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {productSearch && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {t('pos.searchResults', { search: productSearch, count: totalProducts })}
              </p>
            </div>
          )}
          
          {products.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <HiShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">{t('pos.noProducts')}</p>
                <p className="text-sm mt-2">{t('pos.searchHint')}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    addToCart(product);
                    if (barcodeInputRef.current) {
                      barcodeInputRef.current.focus();
                    }
                  }}
                  className="bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all p-3 text-left group"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={productService.getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600">
                      {product.name}
                    </h3>
                    {product.barcode && (
                      <p className="text-xs text-gray-500 font-mono">{product.barcode}</p>
                    )}
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(parseFloat(product.price), product.currency || 'UZS')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalProducts > 20 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setProductPage(p => Math.max(1, p - 1))}
                disabled={productPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('pos.previous')}
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {t('pos.page')} {productPage} / {Math.ceil(totalProducts / 20)}
              </span>
              <button
                onClick={() => setProductPage(p => p + 1)}
                disabled={productPage >= Math.ceil(totalProducts / 20)}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('pos.next')}
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Cart */}
        <div className="w-full sm:w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">{t('pos.cart')}</h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <HiTrash className="w-4 h-4" />
                  {t('pos.clear')}
                </button>
              )}
            </div>
            {/* Customer Info in Cart */}
            {selectedCustomer ? (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <div className="font-medium text-blue-900">{t('pos.customer')} {selectedCustomer.name}</div>
                {selectedCustomer.debt > 0 && (
                  <div className="text-red-600 mt-0.5">{t('pos.debt')} {formatCurrency(selectedCustomer.debt, 'UZS')}</div>
                )}
              </div>
            ) : (
              <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                {t('pos.customerSelector.anonymous')}
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <HiShoppingCart className="w-16 h-16 mb-4" />
                <p className="text-sm">{t('pos.emptyCart')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(item.unitPrice, item.product?.currency || 'UZS')} {t('pos.perUnit')}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                        >
                          <HiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                        >
                          <HiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(item.total, item.product?.currency || 'UZS')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer - Totals & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('pos.subtotal')}:</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(subtotal, cartCurrency)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('pos.discount')}</span>
                    <span className="text-red-600 font-medium">-{formatCurrency(totalDiscount, cartCurrency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">{t('pos.total')}:</span>
                  <span className="text-gray-900">{formatCurrency(total, cartCurrency)}</span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
                >
                  {t('pos.checkout')}
                </button>
                {onSplitPayment && (
                  <button
                    onClick={handleSplitPayment}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    {t('pos.splitPayment')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSScreen;
