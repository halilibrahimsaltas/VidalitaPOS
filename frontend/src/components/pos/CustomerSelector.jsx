import { useState, useEffect } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { HiUserGroup } from 'react-icons/hi2';
import { HiX } from 'react-icons/hi';
import Modal from '../common/Modal';
import Input from '../common/Input';

const CustomerSelector = ({ selectedCustomer, onSelectCustomer, onClearCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCustomers({
    page,
    limit: 10,
    search: search || undefined,
    isActive: true,
  });

  const customers = data?.data?.customers || [];
  const pagination = data?.data?.pagination || {};

  useEffect(() => {
    if (isModalOpen) {
      setSearch('');
      setPage(1);
    }
  }, [isModalOpen]);

  const handleSelect = (customer) => {
    onSelectCustomer(customer);
    setIsModalOpen(false);
    setSearch('');
  };

  return (
    <>
      {/* Customer Display */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {selectedCustomer ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg min-w-[180px]">
            <HiUserGroup className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-blue-600 font-medium">Müşteri</div>
              <div className="text-sm font-semibold text-blue-900 truncate">
                {selectedCustomer.name}
              </div>
            </div>
            <button
              onClick={onClearCustomer}
              className="text-blue-600 hover:text-blue-800 flex-shrink-0"
              title="Anonim Yap"
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 text-sm text-gray-700 whitespace-nowrap transition-colors min-w-[140px]"
            title="Müşteri Seç (Opsiyonel)"
          >
            <HiUserGroup className="w-5 h-5 text-gray-500" />
            <div className="text-left">
              <div className="text-xs text-gray-500">Anonim</div>
              <div className="text-sm font-medium">Müşteri Seç</div>
            </div>
          </button>
        )}
      </div>

      {/* Customer Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Müşteri Seç (Opsiyonel)"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>İpucu:</strong> Müşteri seçmezseniz satış anonim olarak kaydedilir. 
              Veresiye ödemesi için müşteri seçimi zorunludur.
            </p>
          </div>

          <Input
            placeholder="Müşteri adı, telefon veya email ile ara..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            autoFocus
          />

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">Müşteri bulunamadı</div>
              <button
                type="button"
                onClick={() => {
                  onClearCustomer();
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anonim Olarak Devam Et
              </button>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {/* Anonymous option */}
                <button
                  type="button"
                  onClick={() => {
                    onClearCustomer();
                    setIsModalOpen(false);
                  }}
                  className="w-full text-left p-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors bg-gray-50"
                >
                  <div className="font-medium text-gray-700">👤 Anonim Müşteri</div>
                  <div className="text-xs text-gray-500 mt-1">Müşteri seçmeden devam et</div>
                </button>

                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelect(customer)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {customer.phone && `Tel: ${customer.phone}`}
                          {customer.phone && customer.email && ' • '}
                          {customer.email && `Email: ${customer.email}`}
                        </div>
                        {customer.debt > 0 && (
                          <div className="text-xs text-red-600 mt-1 font-medium">
                            ⚠️ Borç: ₺{customer.debt.toFixed(2)}
                          </div>
                        )}
                      </div>
                      {selectedCustomer?.id === customer.id && (
                        <div className="ml-2 text-blue-600">
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Sayfa {pagination.page} / {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Önceki
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={page >= pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default CustomerSelector;

