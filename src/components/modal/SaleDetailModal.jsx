import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdPayments, MdListAlt } from "react-icons/md";

const SaleDetailModal = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  const order = sale.order || {};
  const orderNumber = order.orderNumber || sale.id.slice(-8).toUpperCase();
  const gcashRef = sale.referenceNo ? `*****${sale.referenceNo.slice(-5)}` : null;
  const table = order.table || sale.table;
  const user = order.user || sale.user;

  // Pricing from Order (has discount/serviceCharge) or fall back to Sale totals
  const subtotal = order.foodSubtotal != null
    ? (order.foodSubtotal + (order.nonFoodSubtotal || 0))
    : sale.saleItems?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const discount = order.discount || 0;
  const serviceCharge = order.serviceCharge || 0;
  const totalAmount = sale.totalAmount || order.totalAmount || 0;
  const amountTendered = order.amountTendered || null;
  const change = order.change || (amountTendered ? amountTendered - totalAmount : null);
  const customerType = order.customerType || null;

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
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-700 font-medium">
                      <span>Discount {customerType ? `(${customerType} 20%)` : ""}</span>
                      <span>-₱{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Service Charge (10%)</span>
                    <span>+₱{serviceCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-emerald-200 pt-2">
                    <span>Total</span>
                    <span className="text-green-600">₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {amountTendered != null && (
                    <div className="flex justify-between text-gray-700">
                      <span>Amount Tendered</span>
                      <span>₱{Number(amountTendered).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {change != null && change >= 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Change</span>
                      <span>₱{Number(change).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-emerald-200 pt-4">
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
                </div>
              </div>

              {/* Additional Info */}
              {(user || table) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
                  {user && (
                    <div>
                      <span className="text-gray-500 block mb-1">User:</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  )}
                  {table && (
                    <div>
                      <span className="text-gray-500 block mb-1">Table:</span>
                      <span className="font-medium">Table {table.number}</span>
                    </div>
                  )}
                  {customerType && customerType !== 'REGULAR' && (
                    <div>
                      <span className="text-gray-500 block mb-1">Customer Type:</span>
                      <span className="font-medium">{customerType}</span>
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

