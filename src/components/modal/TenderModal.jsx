import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdAttachMoney, MdPayments } from "react-icons/md";

const TenderModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  orderId = null,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [amountTendered, setAmountTendered] = useState("");
  const [changeAmount, setChangeAmount] = useState(0);

  // Auto-set tendered to total when opened
  useEffect(() => {
    if (isOpen) {
      setAmountTendered(totalAmount.toFixed(2));
    }
  }, [isOpen, totalAmount]);

  // Calculate change real-time
  useEffect(() => {
    const tendered = parseFloat(amountTendered) || 0;
    setChangeAmount(tendered - totalAmount);
  }, [amountTendered, totalAmount]);

  const handleConfirm = async () => {
    const tendered = parseFloat(amountTendered) || 0;
    if (tendered < totalAmount) {
      alert(`Amount tendered (₱${tendered.toFixed(2)}) must be >= total (₱${totalAmount.toFixed(2)})`);
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm("CASH", null, tendered);
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmountTendered("");
      setChangeAmount(0);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white relative rounded-t-2xl">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition disabled:opacity-50"
                >
                  <MdClose className="text-2xl" />
                </button>
                <div className="text-center">
                  <MdPayments className="text-4xl mx-auto mb-3" />
                  <h2 className="text-2xl font-bold mb-1">Process Payment</h2>
                  <p className="text-white/90 text-sm">
                    Order #{orderId} - Cash Payment
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Total Amount */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl text-center border-2 border-gray-200">
                  <p className="text-gray-600 font-medium mb-2">Order Total</p>
                  <p className="text-4xl font-bold text-emerald-600">
                    ₱{totalAmount.toFixed(2)}
                  </p>
                </div>

                {/* Amount Tendered Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <MdAttachMoney className="text-2xl text-emerald-600" />
                    Amount Tendered
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={totalAmount}
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    placeholder={`Min: ₱${totalAmount.toFixed(2)}`}
                    disabled={isProcessing}
                    className="w-full px-6 py-5 rounded-2xl border-3 border-emerald-200 focus:border-emerald-400 focus:outline-none transition-all text-2xl font-bold text-right bg-emerald-50"
                  />
                </div>

                {/* Change Display - Prominent */}
                <div className={`p-6 rounded-2xl text-center border-4 transition-all ${changeAmount >= 0 ? 'border-emerald-300 bg-emerald-50 shadow-lg' : 'border-red-300 bg-red-50 shadow-lg'}`}>
                  <span className={`text-lg font-bold ${changeAmount >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                    {changeAmount >= 0 ? 'Change Due:' : 'Shortfall:'}
                  </span>
                  <div className={`text-4xl font-black mt-2 ${changeAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ₱{Math.abs(changeAmount).toFixed(2)}
                  </div>
                  {changeAmount < 0 && (
                    <p className="text-sm mt-2 text-red-700 font-medium">
                      Enter more to proceed
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-3 bg-gray-50 rounded-b-2xl">
                <motion.button
                  onClick={handleConfirm}
                  disabled={isProcessing || changeAmount < 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-5 px-8 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  whileHover={changeAmount >= 0 && !isProcessing ? { scale: 1.02 } : {}}
                  whileTap={changeAmount >= 0 && !isProcessing ? { scale: 0.98 } : {}}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <MdPayments className="text-2xl" />
                      Complete Payment
                    </>
                  )}
                </motion.button>
                <motion.button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="w-full border-2 border-gray-300 text-gray-700 py-4 px-8 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all disabled:opacity-50"
                  whileHover={!isProcessing ? { scale: 1.02 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TenderModal;
