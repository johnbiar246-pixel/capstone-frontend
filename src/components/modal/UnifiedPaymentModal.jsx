import React, { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdPayments, MdAttachMoney, MdReceiptLong, MdInfo, MdPerson, MdAccessibility } from "react-icons/md";
import { FaMoneyBillWave } from "react-icons/fa";

const UnifiedPaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount: rawTotal, 
  cartItems = [], 
  orderItems = [], 
  orderId = null,
  mode = "customer-new", 
  customerType: initialCustomerType = "REGULAR",
  tableNumber = null,
  autoFill = true
}) => {
const [amountTendered, setAmountTendered] = useState("");
  const [customerType, setCustomerType] = useState(initialCustomerType);
  const [isProcessing, setIsProcessing] = useState(false);
  const [changeAmount, setChangeAmount] = useState(0);
const [breakdown, setBreakdown] = useState({ subtotal: 0, discount: 0, serviceCharge: 0, total: 0 });
  const [total, setTotal] = useState(0);

  const { calculateCartBreakdown } = useCart();

  useEffect(() => {
    let subtotal, discountAmount, serviceChargeAmount, totalAmount;
    
    // Determine items to use for calculation
    const itemsToUse = cartItems.length > 0 ? cartItems : orderItems;
    
    if (itemsToUse.length > 0) {
      // Use CartContext breakdown logic for both customer-new and staff-accept
      const breakdown = calculateCartBreakdown(itemsToUse, customerType);
      subtotal = breakdown.subtotal;
      discountAmount = breakdown.discount;
      serviceChargeAmount = breakdown.serviceCharge;
      totalAmount = breakdown.total;
    } else if (rawTotal > 0) {
      // Fallback for rawTotal without items
      subtotal = rawTotal;
      discountAmount = customerType !== 'REGULAR' ? rawTotal * 0.2 : 0;
      const applicable = subtotal - discountAmount;
      serviceChargeAmount = applicable * 0.1;
      totalAmount = applicable + serviceChargeAmount;
    } else {
      subtotal = 0;
      discountAmount = 0;
      serviceChargeAmount = 0;
      totalAmount = 0;
    }

    const newBreakdown = {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discountAmount.toFixed(2)),
      serviceCharge: parseFloat(serviceChargeAmount.toFixed(2)),
      total: parseFloat(totalAmount.toFixed(2))
    };
    
    setBreakdown(newBreakdown);
    setTotal(newBreakdown.total);
    if (newBreakdown.total > 0 && autoFill && amountTendered === "") {
      setAmountTendered(newBreakdown.total.toFixed(2));
    }
  }, [cartItems, orderItems, customerType, rawTotal, calculateCartBreakdown, autoFill, amountTendered]);

  useEffect(() => {
    const tendered = parseFloat(amountTendered) || 0;
    setChangeAmount(tendered - total);
  }, [amountTendered, total]);

  const handleConfirm = async () => {
    const tendered = parseFloat(amountTendered) || 0;
    
    if (tendered < total) {
      alert(`Amount tendered (₱${tendered.toFixed(2)}) must be >= total (₱${total.toFixed(2)})`);
      return;
    }

    setIsProcessing(true);
    try {
      const paymentDetails = {
        paymentMethod: "CASH",
        amountTendered: tendered,
        customerType,
        breakdown,  // Full breakdown for order submission
        orderId,
        tableNumber,
        mode
      };
      await onConfirm(total, paymentDetails);
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) onClose();
  };

  const getTitle = () => {
    const titles = {
      "customer-new": "Confirm Your Order", 
      "staff-new": "Complete New Order",
      "staff-accept": `Accept Payment - Order #${orderId}`
    };
    return titles[mode] || "Process Payment";
  };

  const customerTypes = [
    { value: "REGULAR", label: "Regular", icon: MdPerson },
    { value: "PWD", label: "PWD (20% food discount)", icon: MdAccessibility },
    { value: "SENIOR", label: "Senior (20% food discount)", icon: MdAccessibility }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white relative rounded-t-2xl">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-all"
            >
              <MdClose className="text-2xl" />
            </button>
            <div className="text-center">
              <MdPayments className="text-5xl mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">{getTitle()}</h2>
              {orderId && tableNumber && (
                <p className="text-white/90 text-sm bg-white/10 px-3 py-1 rounded-full">
                  Order #{orderId} • Table {tableNumber}
                </p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Breakdown */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-800">
                <MdReceiptLong /> Order Breakdown
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1">
                  <span>Subtotal</span>
                  <span className="font-semibold">₱{breakdown.subtotal.toFixed(2)}</span>
                </div>
                {breakdown.discount > 0 && (
                  <div className="flex justify-between py-1 text-green-600 font-semibold bg-green-50 px-3 rounded-lg">
                    <span>Discount (20% food)</span>
                    <span>-₱{breakdown.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 text-emerald-600 font-semibold bg-emerald-50 px-3 rounded-lg">
                  <span>Service Charge (10% after discount)</span>
                  <span>+₱{breakdown.serviceCharge.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 mt-3">
                  <div className="flex justify-between items-end pb-2">
                    <span className="text-2xl font-black text-gray-900">TOTAL</span>
                  <span className="text-3xl font-black text-emerald-600">
                      ₱{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Type */}
            {(mode === "customer-new" || mode === "staff-new") && (
              <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-200">
                <label className="block text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <MdPerson className="text-xl" /> Customer Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {customerTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setCustomerType(type.value)}
                      className={`p-4 rounded-xl border-3 transition-all flex flex-col items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md h-24 ${
                        customerType === type.value
                          ? "border-blue-500 bg-blue-100 text-blue-800 shadow-blue-200"
                          : "border-blue-200 bg-white text-blue-700 hover:border-blue-400"
                      }`}
                    >
                      <type.icon className="text-2xl" />
                      <span className="font-semibold">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CASH Only */}
            <div className="text-center py-8 bg-gradient-to-b from-emerald-50 to-white rounded-2xl border-2 border-emerald-200">
              <FaMoneyBillWave className="text-6xl text-emerald-500 mx-auto mb-4 animate-bounce" />
              <div className="text-2xl font-black text-emerald-700 mb-1">CASH PAYMENT</div>
              <div className="text-emerald-600 font-semibold">Only cash accepted</div>
            </div>

            {/* Tendered Input */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-xl font-bold text-gray-800">
                <MdAttachMoney className="text-3xl text-emerald-600" />
                Amount Tendered
              </label>
              <div className="relative">
                  <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min={total}
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  disabled={isProcessing}
                  placeholder={`Minimum: ₱${total.toFixed(2)}`}
                  className="w-full px-6 py-5 rounded-2xl border-4 border-emerald-200 focus:border-emerald-400 focus:outline-none transition-all text-2xl font-bold text-right bg-emerald-50 shadow-lg hover:shadow-xl"
                />

              </div>
            </div>

            {/* Change Display */}
            <div className={`p-6 rounded-2xl text-center border-4 shadow-xl transition-all ${
              changeAmount >= 0 
                ? 'border-emerald-400 bg-emerald-50' 
                : 'border-red-400 bg-red-50'
            }`}>
              <span className={`text-xl font-bold block mb-2 ${
                changeAmount >= 0 ? 'text-emerald-800' : 'text-red-800'
              }`}>
                {changeAmount >= 0 ? 'Change Due:' : 'Short by:'}
              </span>
              <div className={`text-4xl font-black mb-3 ${
                changeAmount >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                ₱{Math.abs(changeAmount).toFixed(2)}
              </div>
              {changeAmount < 0 && (
                <p className="text-sm font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full inline-block">
                  Enter higher amount to continue
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="p-6 pt-0 space-y-3 bg-gray-50 rounded-b-2xl">
            <motion.button
              onClick={handleConfirm}
              disabled={isProcessing || changeAmount < 0}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-5 px-8 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:to-emerald-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              whileHover={changeAmount >= 0 && !isProcessing ? { scale: 1.02 } : {}}
              whileTap={changeAmount >= 0 && !isProcessing ? { scale: 0.98 } : {}}
            >
              {isProcessing ? (
                <>
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <MdPayments className="text-2xl" />
                  {mode === "staff-accept" ? "Accept & Complete" : "Pay Now"}
                </>
              )}
            </motion.button>
            
            <motion.button
              onClick={handleClose}
              disabled={isProcessing}
              className="w-full border-2 border-gray-300 text-gray-700 py-4 px-8 rounded-2xl font-bold text-lg hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all disabled:opacity-50"
              whileHover={!isProcessing ? { scale: 1.02 } : {}}
              whileTap={!isProcessing ? { scale: 0.98 } : {}}
            >
              Cancel
            </motion.button>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 border-t border-blue-200 rounded-b-2xl">
            <div className="flex items-start gap-3 text-sm text-blue-800">
              <MdInfo className="text-lg flex-shrink-0 mt-0.5" />
              <div>
                <p><strong>Next:</strong> Order will be marked PREPARING and receipt generated automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnifiedPaymentModal;

