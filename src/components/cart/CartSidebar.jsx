import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  MdClose,
  MdRestaurantMenu,
  MdDelete,
  MdAdd,
  MdRemove,
  MdLocalDining,
  MdWineBar,
} from "react-icons/md";
import { useCart } from "../../contexts/CartContext";
import UnifiedPaymentModal from "../modal/UnifiedPaymentModal";
import { getTableByNumber } from "../../api/tables";

const CartSidebar = () => {
  const {
    cart,
    customerType,
    setCustomerType,
    calculateCartBreakdown,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemCount,
    clearCart,
    placeOrder,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");

  const handlePlaceOrderClick = () => {
    if (!tableNumber) {
      alert("Please scan a table QR code first to place an order.");
      navigate("/scan-table");
      return;
    }
    setShowPaymentModal(true);
  };

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePaymentConfirm = async (total, paymentDetails) => {
    try {
      // Fetch table data to get the UUID
      const tableResponse = await getTableByNumber(tableNumber);
      if (!tableResponse.success || !tableResponse.data) {
        showNotification("Invalid table. Please scan again.", "error");
        return;
      }

      const tableId = tableResponse.data.id;

      const response = await placeOrder(
        tableId, 
        paymentDetails.paymentMethod, 
        paymentDetails.referenceNo,
        paymentDetails.amountTendered,
        customerType,
        paymentDetails.breakdown  // Pass breakdown to API
      );

      if (response.success) {
        showNotification(
          "Order placed successfully with discount & service charge! Staff will review shortly.",
          "success",
        );
        setShowPaymentModal(false);
        clearCart();
        closeCart();
      } else {
        showNotification(
          response.message || "Failed to place order. Please try again.",
          "error",
        );
      }
    } catch (error) {
      console.error("Error placing order:", error);
      showNotification(
        error.response?.data?.message ||
          error.message ||
          "Failed to place order. Please try again.",
        "error",
      );
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#f8f9f7] shadow-2xl z-50 flex flex-col border-l-4 border-[#F4B860]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a2f18] via-[#254F22] to-[#3C3D37] p-6 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-[#F4B860] p-2 rounded-lg">
                  <MdWineBar className="text-2xl text-[#3C3D37]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#F4B860]">My Order</h2>
                  <p className="text-white/80 text-sm">
                    {getCartItemCount()} item
                    {getCartItemCount() !== 1 ? "s" : ""} selected
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="text-white/70 hover:text-[#F4B860] transition p-2 hover:bg-white/10 rounded-full"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full text-center px-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-[#254F22]/10 p-6 rounded-full mb-4">
                    <MdLocalDining className="text-6xl text-[#254F22]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#3C3D37] mb-2">
                    Ready to order?
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Browse our menu and add your favorite dishes and drinks
                  </p>
                  <button
                    onClick={closeCart}
                    className="bg-[#254F22] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1f3f1c] transition shadow-md flex items-center gap-2"
                  >
                    <MdRestaurantMenu />
                    Browse Menu
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      className="bg-white rounded-xl p-4 flex gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                    >
                      {/* Product Image */}
                      <div
                        className={`w-20 h-20 rounded-lg bg-gradient-to-br ${item.color || "from-gray-400 to-gray-600"} flex items-center justify-center flex-shrink-0 shadow-inner`}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <MdLocalDining className="text-2xl text-white/80" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#3C3D37] truncate">
                          {item.name}
                        </h4>
                        <p className="text-[#254F22] font-bold">
                          ₱{item.price.toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 rounded-full bg-[#f1f4ef] border border-[#254F22]/20 flex items-center justify-center text-[#254F22] hover:bg-[#254F22] hover:text-white transition"
                          >
                            <MdRemove className="text-sm" />
                          </button>
                          <span className="w-8 text-center font-semibold text-[#3C3D37]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full bg-[#f1f4ef] border border-[#254F22]/20 flex items-center justify-center text-[#254F22] hover:bg-[#254F22] hover:text-white transition"
                          >
                            <MdAdd className="text-sm" />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove ${item.name} from cart?`)) {
                            removeFromCart(item.id);
                            showNotification(`${item.name} removed from cart.`, "success");
                          }
                        }}
                        className="text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-full self-start"
                      >
                        <MdDelete className="text-xl" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t-2 border-[#F4B860]/30 p-6 bg-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#3C3D37] font-medium">
                    Order Total
                  </span>
                  <span className="text-2xl font-bold text-[#254F22]">
                    ₱{getCartTotal().toFixed(2)}
                  </span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handlePlaceOrderClick}
                    className="w-full bg-gradient-to-r from-[#F4B860] to-[#e5a950] text-[#3C3D37] py-4 rounded-xl font-bold hover:shadow-lg transition shadow-md flex items-center justify-center gap-2"
                  >
                    <MdLocalDining />
                    Place Order
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 border-2 border-red-300 text-red-500 py-3 rounded-xl font-medium hover:bg-red-50 transition"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={closeCart}
                      className="flex-1 border-2 border-[#254F22]/30 text-[#3C3D37] py-3 rounded-xl font-medium hover:bg-[#f1f4ef] transition"
                    >
                      Add More
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Unified Payment Modal */}
      <UnifiedPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        totalAmount={getCartTotal()}
        cartItems={cart}
        customerType={customerType}
        tableNumber={tableNumber}
        mode="customer-new"
        autoFill={false}
      />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-6 left-1/2 z-[60] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
              notification.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                : "bg-gradient-to-r from-red-500 to-red-600 text-white"
            }`}
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              {notification.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <p className="font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white/70 hover:text-white"
            >
              <MdClose className="text-xl" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default CartSidebar;
