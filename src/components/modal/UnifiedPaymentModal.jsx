import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdPayments,
  MdAttachMoney,
  MdReceiptLong,
  MdInfo,
  MdPerson,
  MdAccessibility,
  MdPayment
} from "react-icons/md";
import { FaMoneyBillWave, FaMobileAlt } from "react-icons/fa";

const UnifiedPaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  cartItems = [],
  orderItems = [],
  orderId = null,
  mode = "customer-new",
  customerType: initialCustomerType = "REGULAR",
  tableNumber = null,
  autoFill = true
}) => {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [amountTendered, setAmountTendered] = useState("");
  const [customerType, setCustomerType] = useState(initialCustomerType);
  const [isProcessing, setIsProcessing] = useState(false);

  // LOCAL BREAKDOWN CALCULATION (independent of context state)
  const calculateLocalBreakdown = useCallback((items, custType) => {
    let subtotal = 0;
    let foodSubtotal = 0;

    items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      // cartItems have category on the item directly; orderItems have it under item.product.category
      const catName = (
        item.category?.name ||
        item.product?.category?.name ||
        item.categoryId ||
        ''
      ).toLowerCase().replace(/\s+/g, '-');
      const isFood = ['appetizers', 'main-dishes'].includes(catName);
      if (isFood) {
        foodSubtotal += itemTotal;
      }
    });

    const discountAmount = (custType === 'PWD' || custType === 'SENIOR') ? foodSubtotal * 0.2 : 0;
    const applicableAmount = subtotal - discountAmount;
    const serviceCharge = applicableAmount * 0.1;
    const total = applicableAmount + serviceCharge;

    return { 
      subtotal: parseFloat(subtotal.toFixed(2)), 
      foodSubtotal: parseFloat(foodSubtotal.toFixed(2)),
      discount: parseFloat(discountAmount.toFixed(2)), 
      serviceCharge: parseFloat(serviceCharge.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  }, []);

  // SAFE BREAKDOWN
  const breakdown = useMemo(() => {
    const itemsToUse = cartItems.length > 0 ? cartItems : orderItems;
    console.log("Cart Items:", cartItems);
    console.log("Order Items:", orderItems);
    console.log("Calculating breakdown with items:", itemsToUse, "and customerType:", customerType);

    if (itemsToUse.length > 0) {
      return calculateLocalBreakdown(itemsToUse, customerType);
    }

    return { subtotal: 0, discount: 0, serviceCharge: 0, total: 0 };
  }, [cartItems, orderItems, customerType, calculateLocalBreakdown]);

  const total = breakdown.total;

  // Auto-fill amount for CASH
  useEffect(() => {
    if (autoFill && paymentMethod === "CASH" && total > 0 && amountTendered === "") {
      setAmountTendered(total.toFixed(2));
    }
  }, [total, autoFill, paymentMethod]);

  // CHANGE CALC
  const changeAmount = useMemo(() => {
    const tendered = parseFloat(amountTendered) || 0;
    return tendered - total;
  }, [amountTendered, total]);

  // GCASH VALIDATION
  const isValidGcashRef = (ref) => /^\d{5}$/.test(ref.trim());

  const handleConfirm = async () => {
    let paymentDetails = {
      customerType,
      breakdown
    };

    if (paymentMethod === "GCASH") {
      const ref = referenceNo.trim();
      if (mode.startsWith("staff") && (!ref || !isValidGcashRef(ref))) {
        alert("GCash reference must be exactly 5 digits");
        return;
      }
      paymentDetails.referenceNo = ref;
      paymentDetails.paymentMethod = "GCASH";
    } else { // CASH
      const tendered = parseFloat(amountTendered) || 0;
      if (tendered < total) {
        alert(`Cash tendered (₱${tendered.toFixed(2)}) must be >= total (₱${total.toFixed(2)})`);
        return;
      }
      paymentDetails.amountTendered = tendered;
      paymentDetails.paymentMethod = "CASH";
    }

    paymentDetails.orderId = orderId;
    paymentDetails.tableNumber = tableNumber;
    paymentDetails.mode = mode;

    setIsProcessing(true);
    try {
      await onConfirm(total, paymentDetails);
    } catch {
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
      "staff-new": "Process Payment",
      "staff-accept": `Accept Payment - Order #${orderId}`
    };
    return titles[mode] || "Process Payment";
  };

  const customerTypes = [
    { value: "REGULAR", label: "Regular", icon: MdPerson },
    { value: "PWD", label: "PWD (20% food)", icon: MdAccessibility },
    { value: "SENIOR", label: "Senior (20% food)", icon: MdAccessibility }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* HEADER */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white relative rounded-t-2xl">
            <button onClick={handleClose} disabled={isProcessing} className="absolute top-4 right-4 text-white/80 hover:text-white">
              <MdClose className="text-2xl" />
            </button>
            <div className="text-center">
              <MdPayments className="text-5xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold">{getTitle()}</h2>
              {orderId && tableNumber && (
                <p className="text-sm mt-2 bg-white/10 px-3 py-1 rounded-full inline-block">
                  Order #{orderId} • Table {tableNumber}
                </p>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-6 space-y-6">
            {/* BREAKDOWN */}
            <div className="bg-gray-50 p-6 rounded-2xl border">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <MdReceiptLong /> Order Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₱{breakdown.subtotal.toFixed(2)}</span>
                </div>
                {breakdown.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount</span>
                    <span>-₱{breakdown.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Service Charge</span>
                  <span>+₱{breakdown.serviceCharge.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-black">
                  <span>TOTAL</span>
                  <span className="text-emerald-600">₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* CUSTOMER TYPE (Radio - exclusive) */}
            {(mode === "customer-new" || mode === "staff-new" || mode === "staff-accept") && (
              <div>
                <label className="block text-sm font-bold mb-3 flex items-center gap-2 text-gray-700">
                  Customer Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {customerTypes.map((type) => (
                    <motion.button
                      key={type.value}
                      type="button"
                      onClick={() => setCustomerType(type.value)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        customerType === type.value
                          ? "bg-emerald-100 border-emerald-500 shadow-md"
                          : "border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <type.icon className="text-2xl" />
                      <div className="text-xs font-medium text-center">{type.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* PAYMENT METHOD SELECTION */}
            <div>
              <label className="flex items-center gap-2 font-bold mb-4 text-gray-700">
                <MdPayment className="text-emerald-600" /> Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* CASH */}
                <motion.button
                  onClick={() => setPaymentMethod("CASH")}
                  disabled={isProcessing}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                    paymentMethod === "CASH"
                      ? "border-green-500 bg-green-50 shadow-lg"
                      : "border-gray-200 hover:border-green-400 hover:shadow-md"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaMoneyBillWave className={`text-3xl ${paymentMethod === "CASH" ? "text-green-600" : "text-gray-400"}`} />
                  <div>
                    <div className={`font-bold ${paymentMethod === "CASH" ? "text-green-700" : "text-gray-700"}`}>Cash</div>
                    <div className="text-xs text-gray-500">Amount tendered</div>
                  </div>
                </motion.button>

                {/* GCASH */}
                <motion.button
                  onClick={() => setPaymentMethod("GCASH")}
                  disabled={isProcessing}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                    paymentMethod === "GCASH"
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 hover:border-blue-400 hover:shadow-md"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaMobileAlt className={`text-3xl ${paymentMethod === "GCASH" ? "text-blue-600" : "text-gray-400"}`} />
                  <div>
                    <div className={`font-bold ${paymentMethod === "GCASH" ? "text-blue-700" : "text-gray-700"}`}>GCash</div>
                    <div className="text-xs text-gray-500">5-digit reference</div>
                  </div>
                </motion.button>
              </div>

              {/* CONDITIONAL INPUTS */}
              <AnimatePresence mode="wait">
                {paymentMethod === "GCASH" && (
                  <motion.div
                    key="gcash"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <label className="block text-sm font-medium text-gray-700">
                      GCash Reference (last 5 digits)
                      {mode.startsWith("staff") && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={5}
                      placeholder="12345"
                      className="w-full p-4 border-2 rounded-xl text-xl font-mono tracking-wider text-center focus:border-blue-500 focus:outline-none"
                      disabled={isProcessing}
                    />
                    {mode.startsWith("staff") && referenceNo && !isValidGcashRef(referenceNo) && (
                      <p className="text-sm text-red-600">Must be exactly 5 digits</p>
                    )}
                  </motion.div>
                )}

                {paymentMethod === "CASH" && (
                  <motion.div
                    key="cash"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <label className="flex items-center gap-2 font-bold text-gray-700">
                      ₱ Amount Given
                    </label>
                    <input
  type="number"
  min={total}
  value={amountTendered}
  onChange={(e) => setAmountTendered(e.target.value)}
  onWheel={(e) => e.target.blur()} // disables scroll changing value
  className="w-full p-5 border-2 rounded-xl text-right text-2xl font-bold focus:border-emerald-500 focus:outline-none"
  placeholder={`Min ₱${total.toFixed(2)}`}
  disabled={isProcessing}
/>
                    {/* CHANGE DISPLAY */}
                    <div className={`p-6 rounded-2xl text-center border-4 transition-all ${
                      changeAmount >= 0 ? 'border-emerald-300 bg-emerald Ascent 50 shadow-lg' : 'border-red-300 bg-red-50 shadow-lg'
                    }`}>
                      <span className={`font-bold text-lg ${
                        changeAmount >= 0 ? 'text-emerald-800' : 'text-red-800'
                      }`}>
                        {changeAmount >= 0 ? 'Change Due' : 'Shortfall'}
                      </span>
                      <div className={`text-3xl font-black mt-2 ${
                        changeAmount >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        ₱{Math.abs(changeAmount).toFixed(2)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="p-6 space-y-3">
            <button
              onClick={handleConfirm}
              disabled={isProcessing || (paymentMethod === "CASH" && changeAmount < 0) || (paymentMethod === "GCASH" && mode.startsWith("staff") && !isValidGcashRef(referenceNo))}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald Ascent 700 text-white p-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : `Pay ₱${total.toFixed(2)} (${paymentMethod})`}
            </button>
            <button
              onClick={handleClose}
              className="w-full py-3 px-6 border border-red-300 bg-red-50 text-red-700 font-semibold rounded-xl hover:bg-red-100 hover:border-red-400 hover:text-red-800 transition-all shadow-sm hover:shadow-md"
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnifiedPaymentModal;
