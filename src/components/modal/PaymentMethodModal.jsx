import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdLocalDining, MdInfo, MdPayment, MdAttachMoney } from "react-icons/md";
import { FaMoneyBillWave, FaMobileAlt } from "react-icons/fa";

const PaymentMethodModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  mode = "customer", // "customer" or "staff"
  orderId = null,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [amountTendered, setAmountTendered] = useState("");

  const handleConfirm = async () => {
    // Validate GCASH reference number (only required for staff mode)
    if (paymentMethod === "GCASH" && mode === "staff" && !referenceNo.trim()) {
      alert("Please enter the GCASH reference number");
      return;
    }

    // Validate CASH amount tendered
    if (paymentMethod === "CASH") {
      const tendered = parseFloat(amountTendered) || 0;
      if (tendered < totalAmount) {
        alert(`Amount tendered (₱${tendered.toFixed(2)}) must be >= total (₱${totalAmount.toFixed(2)})`);
        return;
      }
    }

    setIsProcessing(true);
    try {
      // Pass referenceNo only for staff mode, null for customer mode
      // Pass amountTendered for CASH
      await onConfirm(
        paymentMethod,
        mode === "staff" ? referenceNo.trim() : null,
        paymentMethod === "CASH" ? parseFloat(amountTendered) : null
      );
    } catch (error) {
      console.error("Order failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const resetState = () => {
    setPaymentMethod("CASH");
    setReferenceNo("");
    setAmountTendered("");
  };

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#254F22] to-[#3C3D37] p-6 text-white relative">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition disabled:opacity-50"
                >
                  <MdClose className="text-2xl" />
                </button>
                <h2 className="text-2xl font-bold mb-2">
                  {mode === "staff" ? "Accept Order" : "Confirm Your Order"}
                </h2>
                <p className="text-white/80 text-sm">
                  {mode === "staff"
                    ? `Select payment method for Order #${orderId}`
                    : "Review your order before placing"}
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Total Amount Display */}
                <div className="bg-[#f8f9f7] p-4 rounded-xl border border-[#254F22]/20">
                  <p className="text-gray-600 text-sm mb-1">Order Total</p>
                  <p className="text-3xl font-bold text-[#254F22]">
                    ₱{totalAmount?.toFixed(2) || "0.00"}
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium flex items-center gap-2">
                    <MdPayment className="text-[#254F22]" />
                    Select Payment Method
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Cash Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod("CASH")}
                      disabled={isProcessing}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === "CASH"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <FaMoneyBillWave
                        className={`text-2xl ${
                          paymentMethod === "CASH"
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          paymentMethod === "CASH"
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        Cash
                      </span>
                    </motion.button>

                    {/* GCash Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod("GCASH")}
                      disabled={isProcessing}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === "GCASH"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <FaMobileAlt
                        className={`text-2xl ${
                          paymentMethod === "GCASH"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          paymentMethod === "GCASH"
                            ? "text-blue-700"
                            : "text-gray-600"
                        }`}
                      >
                        GCash
                      </span>
                    </motion.button>
                  </div>

                  {/* GCash Reference Number Input - Only for staff mode */}
                  <AnimatePresence>
                    {paymentMethod === "GCASH" && mode === "staff" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-sm text-gray-600 font-medium">
                          GCash Reference Number *
                        </label>
                        <input
                          type="text"
                          value={referenceNo}
                          onChange={(e) => setReferenceNo(e.target.value)}
                          placeholder="Enter reference number"
                          disabled={isProcessing}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition"
                        />
                        <p className="text-xs text-gray-500">
                          Required for GCash payments
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* CASH Amount Tendered Input */}
                  <AnimatePresence>
                    {paymentMethod === "CASH" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <label className="text-sm text-gray-600 font-medium flex items-center gap-2">
                          <MdAttachMoney className="text-emerald-500" />
                          Amount Tendered *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min={totalAmount}
                          value={amountTendered}
                          onChange={(e) => setAmountTendered(e.target.value)}
                          placeholder={`0.00 (min: ₱${totalAmount.toFixed(2)})`}
                          disabled={isProcessing}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition text-lg font-bold text-right"
                        />
                        {(() => {
                          const tendered = parseFloat(amountTendered) || 0;
                          const change = tendered - totalAmount;
                          if (change >= 0) {
                            return (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                                <span className="text-sm font-medium text-emerald-800">Change:</span>
                                <div className="text-2xl font-bold text-emerald-600 mt-1">
                                  ₱{change.toFixed(2)}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                                <span className="text-sm font-medium text-red-800">Insufficient Amount</span>
                                <div className="text-lg font-bold text-red-600 mt-1">
                                  Need ₱{Math.abs(change).toFixed(2)} more
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Info Note */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MdInfo className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium text-sm mb-1">
                      {mode === "staff" ? "What happens next?" : "Payment Info"}
                    </p>
                    <p className="text-blue-600 text-sm">
                      {mode === "staff"
                        ? "The order will be marked as preparing. Payment will be collected when serving."
                        : "Your order will be sent to our staff for review. Payment will be collected when your order is ready."}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Footer Buttons */}
              <div className="p-6 pt-0 space-y-3">
                <motion.button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-[#254F22] to-[#3C3D37] text-white py-4 rounded-xl font-bold hover:shadow-lg transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                  whileHover={!isProcessing ? { scale: 1.02 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <MdLocalDining className="text-xl" />
                      {mode === "staff" ? "Accept Order" : "Place Order"}
                    </>
                  )}
                </motion.button>

                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="w-full border-2 border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaymentMethodModal;
