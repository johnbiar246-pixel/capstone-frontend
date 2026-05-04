import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdPayments, MdListAlt } from "react-icons/md";

const SaleDetailModal = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  const orderNumber = sale.id.slice(-8).toUpperCase(); // Short readable # from UUID
  const gcashRef = sale.referenceNo ? `*****${sale.referenceNo.slice(-5)}` : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <MdListAlt className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Order #{orderNumber}</h2>
                    <p className="text-sm text-gray-500">{new Date(sale.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <MdClose className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Items List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Items ({sale.saleItems?.length || 0})
                </h3>
                <div className="space-y-3">
                  {sale.saleItems?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-900">{item.product?.name}</div>
                        <div className="text-sm text-gray-500">₱{item.price} x {item.quantity}</div>
                      </div>
                      <div className="font-semibold text-green-600 text-lg">
                        ₱{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {(!sale.saleItems || sale.saleItems.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No items</p>
                  )}
                </div>
              </div>

              {/* Payment & Total */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <MdPayments className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Method:</span>
                    <div className={`font-semibold px-3 py-1 rounded-full mt-1 inline-block ${
                      sale.paymentMethod === 'CASH' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {sale.paymentMethod}
                    </div>
                  </div>
                  {sale.paymentMethod === 'GCASH' && gcashRef && (
                    <div>
                      <span className="text-gray-500">Reference:</span>
                      <div className="font-mono font-semibold text-sm bg-gray-100 px-3 py-1 rounded-lg mt-1">
                        {gcashRef}
                      </div>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Total Amount:</span>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      ₱{sale.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(sale.user || sale.table) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
                  {sale.user && (
                    <div>
                      <span className="text-gray-500 block mb-1">User:</span>
                      <span className="font-medium">{sale.user.name}</span>
                    </div>
                  )}
                  {sale.table && (
                    <div>
                      <span className="text-gray-500 block mb-1">Table:</span>
                      <span className="font-medium">Table {sale.table.number}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaleDetailModal;

