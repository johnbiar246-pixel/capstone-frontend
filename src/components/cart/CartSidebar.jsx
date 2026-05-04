import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
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
import { checkoutOrder } from "../../api/checkout";

const CartSidebar = () => {
  const {
    cart,
    customerType,
    setCustomerType,
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

  const [notification, setNotification] = useState(null);
  const location = useLocation();

  // Auto-close cart when navigating to other routes
  useEffect(() => {
    closeCart();
  }, [location.pathname]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };


  const handlePlaceOrderClick = () => {
    if (!tableNumber) {
      alert("Please scan a table QR code first to place an order.");
      navigate("/scan-table");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (total, paymentDetails) => {
    try {
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
        null, // breakdown
        "customer" // mode
      );

      if (response.success) {
        showNotification(
          `Order placed successfully! Order #${response.data.orderNumber}`,
          "success"
        );

        setShowPaymentModal(false);
        clearCart();
        closeCart();
        navigate("/user/orders?tab=upcoming");
      } else {
        showNotification(response.message || "Order failed", "error");
      }
    } catch (error) {
      console.error(error);
      showNotification(
        error.response?.data?.message || "Order failed",
        "error"
      );
    }
  };

  // SAFE KEY GENERATOR (FIXED BUG HERE)
  const getSafeKey = (item, index) => {
    // Create a unique key using multiple fallbacks
    const id = item?.id || item?._id || item?.productId;
    const name = item?.name || 'unknown';
    const price = item?.price || 0;

    // Use crypto.randomUUID if available, otherwise use timestamp + random
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `fallback-${Date.now()}-${Math.random()}`;

    // If we have a valid ID, use it
    if (id && typeof id === 'string' && id.trim()) {
      return `item-${id}-${index}`;
    }

    // Fallback with unique identifier
    return `item-${name}-${price}-${index}-${uniqueId}`;
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            key="cart-backdrop"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* SIDEBAR */}
          <motion.div
            key="cart-sidebar"
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#f8f9f7] shadow-2xl z-50 flex flex-col border-l-4 border-[#F4B860]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
          >
            {/* HEADER (UNCHANGED UI) */}
            <div className="bg-gradient-to-r from-[#1a2f18] via-[#254F22] to-[#3C3D37] p-6 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-[#F4B860] p-2 rounded-lg">
                  <MdWineBar className="text-2xl text-[#3C3D37]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#F4B860]">My Order</h2>
                  <p className="text-white/80 text-sm">
                    {getCartItemCount()} item{getCartItemCount() !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button onClick={closeCart} className="text-white/70 hover:text-[#F4B860] p-2">
                <MdClose className="text-2xl" />
              </button>
            </div>

            {/* CART ITEMS */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <MdLocalDining className="text-6xl text-[#254F22]" />
                  <h3 className="text-xl font-semibold mt-4">Ready to order?</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <motion.div
                      key={getSafeKey(item, index)}
                      className="bg-white rounded-xl p-4 flex gap-4 shadow-sm border border-gray-100"
                      layout
                    >
                      {/* IMAGE */}
                      <div
                        className={`w-20 h-20 rounded-lg bg-gradient-to-br ${
                          item.color || "from-gray-400 to-gray-600"
                        } flex items-center justify-center`}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <MdLocalDining className="text-2xl text-white" />
                        )}
                      </div>

                      {/* DETAILS */}
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-[#254F22] font-bold">
                          ₱{item.price.toFixed(2)}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                          >
                            <MdRemove />
                          </button>

                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                          >
                            <MdAdd />
                          </button>
                        </div>
                      </div>

                      {/* DELETE */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 p-2"
                      >
                        <MdDelete />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER */}
            {cart.length > 0 && (
              <div className="p-6 border-t">
                <div className="flex justify-between mb-4">
                  <span>Total</span>
                  <span className="font-bold text-[#254F22]">
                    ₱{getCartTotal().toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handlePlaceOrderClick}
                  className="w-full bg-[#F4B860] py-4 rounded-xl font-bold"
                >
                  Place Order
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* PAYMENT MODAL */}
      <UnifiedPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        cartItems={cart}
        customerType={customerType}
        tableNumber={tableNumber}
        mode="customer-new"
        autoFill={false}
      />
    </AnimatePresence>
  );
};

export default CartSidebar;